require "test_helper"

class JobsApiTest < ActionDispatch::IntegrationTest
  setup do
    ActiveStorage::Attachment.delete_all
    ActiveStorage::Blob.delete_all
    JobTechStack.delete_all
    Job.delete_all
    Location.delete_all
    Position.delete_all
    TechStack.delete_all

    @tokyo = Location.create!(name: "東京", score_weight: 6, active: true, display_order: 0)
    @osaka = Location.create!(name: "大阪", score_weight: 4, active: true, display_order: 1)
    @fukuoka = Location.create!(name: "福岡", score_weight: 3, active: true, display_order: 2)
    @backend = Position.create!(name: "バックエンドエンジニア", score_weight: 8, active: true, display_order: 0)
    @frontend = Position.create!(name: "フロントエンドエンジニア", score_weight: 5, active: true, display_order: 1)
    @rails = TechStack.create!(name: "Ruby on Rails", score_weight: 20, active: true, display_order: 0)
    @typescript = TechStack.create!(name: "TypeScript", score_weight: 15, active: true, display_order: 1)
    @react = TechStack.create!(name: "React", score_weight: 8, active: true, display_order: 2)

    @job1 = Job.new(
      company_name: "サンプル会社 A",
      position: @backend,
      status: "interested",
      work_style: "full_remote",
      employment_type: "full_time",
      salary_min: 5_000_000,
      salary_max: 7_000_000,
      location: @tokyo,
      notes: "第一候補",
      updated_at: Time.zone.parse("2026-04-02 10:00:00")
    )
    @job1.tech_stacks = [ @rails, @typescript ]
    @job1.save!

    @job2 = Job.new(
      company_name: "サンプル会社 B",
      position: @frontend,
      status: "offer",
      work_style: "hybrid",
      employment_type: "contract",
      salary_min: 5_500_000,
      salary_max: 7_500_000,
      location: @osaka,
      notes: "内定済み",
      updated_at: Time.zone.parse("2026-04-01 10:00:00")
    )
    @job2.tech_stacks = [ @react, @typescript ]
    @job2.save!
  end

  test "index returns filtered jobs with master data" do
    get "/api/jobs", params: { keyword: "バックエンド", status: "interested", work_style: "full_remote" }

    assert_response :success

    body = JSON.parse(response.body)

    assert_equal 1, body["jobs"].length
    assert_equal @job1.id, body["jobs"].first["id"]
    assert_equal @backend.id, body["jobs"].first["position_id"]
    assert_equal @tokyo.id, body["jobs"].first["location_id"]
    assert_equal 2, body["jobs"].first["tech_stack_ids"].length
    assert_equal 1, body["meta"]["total_count"]
    assert_equal 1, body["meta"]["summary"]["remote_friendly"]
    assert_equal 1, body["meta"]["summary"]["active_pipeline"]
    assert_equal 1, body["meta"]["summary"]["high_score"]
  end

  test "index searches by associated location and tech stack names" do
    get "/api/jobs", params: { keyword: "大阪" }

    assert_response :success
    body = JSON.parse(response.body)
    assert_equal [ @job2.id ], body["jobs"].map { |job| job["id"] }

    get "/api/jobs", params: { keyword: "React" }

    assert_response :success
    body = JSON.parse(response.body)
    assert_equal [ @job2.id ], body["jobs"].map { |job| job["id"] }
  end

  test "index sorts jobs by salary_max ascending" do
    get "/api/jobs", params: { sort: "salary_max", direction: "asc" }

    assert_response :success

    body = JSON.parse(response.body)

    assert_equal [ @job1.id, @job2.id ], body["jobs"].map { |job| job["id"] }
  end

  test "show returns detailed job response with associated data" do
    get "/api/jobs/#{@job1.id}"

    assert_response :success

    body = JSON.parse(response.body)

    assert_equal @job1.id, body["id"]
    assert_equal @backend.id, body["position_id"]
    assert_equal @tokyo.id, body["location_id"]
    assert_equal "バックエンドエンジニア", body["position"]
    assert_equal "東京", body["location"]
    assert_equal [ @rails.id, @typescript.id ].sort, body["tech_stack_ids"].sort
    assert_equal 2, body["tech_stacks"].length
    assert_equal @backend.id, body["position_master"]["id"]
    assert_equal @tokyo.id, body["location_master"]["id"]
    assert_nil body["company_logo_url"]
    assert_nil body["company_logo_filename"]
  end

  test "update changes status and keeps existing master associations" do
    patch "/api/jobs/#{@job1.id}", params: { job: { status: "interviewing" } }, as: :json

    assert_response :success

    body = JSON.parse(response.body)

    assert_equal "interviewing", body["status"]
    assert_equal "Ruby on Rails, TypeScript", body["tech_stack"]
    assert_equal "interviewing", @job1.reload.status
    assert_equal 2, @job1.tech_stacks.count
  end

  test "create persists a new job with master ids" do
    assert_difference("Job.count", 1) do
      post "/api/jobs",
        params: {
          job: {
            company_name: "サンプル会社 C",
            position_id: @backend.id,
            status: "applied",
            work_style: "onsite",
            employment_type: "full_time",
            salary_min: 6_000_000,
            salary_max: 8_000_000,
            tech_stack_ids: [ @react.id, @typescript.id ],
            location_id: @fukuoka.id,
            notes: "新規追加"
          }
        },
        as: :json
    end

    assert_response :created

    body = JSON.parse(response.body)

    assert_equal "サンプル会社 C", body["company_name"]
    assert_equal "バックエンドエンジニア", body["position"]
    assert_equal [ @react.id, @typescript.id ].sort, body["tech_stack_ids"].sort
  end

  test "create attaches a company logo" do
    logo = Rack::Test::UploadedFile.new(
      Rails.root.join("test/fixtures/files/company-logo.svg"),
      "image/svg+xml"
    )

    assert_difference("Job.count", 1) do
      post "/api/jobs",
        params: {
          job: {
            company_name: "ロゴ付き会社",
            position_id: @backend.id,
            status: "applied",
            work_style: "hybrid",
            employment_type: "full_time",
            salary_min: 6_000_000,
            salary_max: 8_000_000,
            tech_stack_ids: [ @rails.id ],
            location_id: @tokyo.id,
            notes: "",
            company_logo: logo
          }
        }
    end

    assert_response :created

    body = JSON.parse(response.body)
    job = Job.find(body["id"])

    assert job.company_logo.attached?
    assert_equal "company-logo.svg", body["company_logo_filename"]
    assert_includes body["company_logo_url"], "/rails/active_storage/blobs/redirect/"
  end

  test "update removes an attached company logo" do
    @job1.company_logo.attach(
      io: Rails.root.join("test/fixtures/files/company-logo.svg").open,
      filename: "company-logo.svg",
      content_type: "image/svg+xml"
    )

    assert @job1.company_logo.attached?

    patch "/api/jobs/#{@job1.id}",
      params: {
        job: {
          remove_company_logo: "1"
        }
      }

    assert_response :success

    body = JSON.parse(response.body)

    assert_not @job1.reload.company_logo.attached?
    assert_nil body["company_logo_url"]
    assert_nil body["company_logo_filename"]
  end

  test "update keeps company logo when validation fails" do
    @job1.company_logo.attach(
      io: Rails.root.join("test/fixtures/files/company-logo.svg").open,
      filename: "company-logo.svg",
      content_type: "image/svg+xml"
    )

    patch "/api/jobs/#{@job1.id}",
      params: {
        job: {
          salary_min: 8_000_000,
          salary_max: 7_000_000,
          remove_company_logo: "1"
        }
      }

    assert_response :unprocessable_entity
    assert @job1.reload.company_logo.attached?
  end

  test "create allows blank notes" do
    assert_difference("Job.count", 1) do
      post "/api/jobs",
        params: {
          job: {
            company_name: "サンプル会社 D",
            position_id: @backend.id,
            status: "interested",
            work_style: "hybrid",
            employment_type: "full_time",
            salary_min: 5_000_000,
            salary_max: 6_500_000,
            tech_stack_ids: [ @rails.id ],
            location_id: @tokyo.id,
            notes: ""
          }
        },
        as: :json
    end

    assert_response :created
    assert_equal "", JSON.parse(response.body)["notes"]
  end

  test "destroy removes job" do
    assert_difference("Job.count", -1) do
      delete "/api/jobs/#{@job2.id}"
    end

    assert_response :no_content
  end

  test "create returns validation errors when required fields are missing" do
    assert_no_difference("Job.count") do
      post "/api/jobs",
        params: {
          job: {
            company_name: "",
            position_id: nil,
            status: "interested",
            work_style: "hybrid",
            employment_type: "full_time",
            salary_min: 6_000_000,
            salary_max: 5_000_000,
            tech_stack_ids: [],
            location_id: nil,
            notes: ""
          }
        },
        as: :json
    end

    assert_response :unprocessable_entity

    body = JSON.parse(response.body)

    assert_includes body["errors"], "Company name can't be blank"
    assert_includes body["errors"], "Position can't be blank"
    assert_includes body["errors"], "Tech stacks can't be blank"
    assert_includes body["errors"], "Location can't be blank"
    assert_includes body["errors"], "Salary max must be greater than or equal to 6000000"
  end

  test "update returns validation errors for invalid payload" do
    patch "/api/jobs/#{@job1.id}",
      params: {
        job: {
          salary_min: 7_500_000,
          salary_max: 5_000_000
        }
      },
      as: :json

    assert_response :unprocessable_entity

    body = JSON.parse(response.body)

    assert_includes body["errors"], "Salary max must be greater than or equal to 7500000"
  end

  test "update rolls back tech stack changes when validation fails" do
    patch "/api/jobs/#{@job1.id}",
      params: {
        job: {
          salary_min: 7_500_000,
          salary_max: 5_000_000,
          tech_stack_ids: [ @react.id ]
        }
      },
      as: :json

    assert_response :unprocessable_entity
    assert_equal [ @rails.id, @typescript.id ].sort, @job1.reload.tech_stack_ids.sort
  end
end
