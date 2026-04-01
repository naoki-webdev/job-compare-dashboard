require "test_helper"

class JobsApiTest < ActionDispatch::IntegrationTest
  setup do
    Job.delete_all

    @job1 = Job.create!(
      company_name: "サンプル会社 A",
      position: "バックエンドエンジニア",
      status: "interested",
      work_style: "full_remote",
      employment_type: "full_time",
      salary_min: 5_000_000,
      salary_max: 7_000_000,
      tech_stack: "Ruby on Rails, TypeScript",
      location: "東京",
      notes: "第一候補",
      updated_at: Time.zone.parse("2026-04-02 10:00:00")
    )

    @job2 = Job.create!(
      company_name: "サンプル会社 B",
      position: "フロントエンドエンジニア",
      status: "offer",
      work_style: "hybrid",
      employment_type: "contract",
      salary_min: 5_500_000,
      salary_max: 7_500_000,
      tech_stack: "React, TypeScript",
      location: "大阪",
      notes: "内定済み",
      updated_at: Time.zone.parse("2026-04-01 10:00:00")
    )
  end

  test "index returns filtered jobs with meta" do
    get "/api/jobs", params: { keyword: "バックエンド", status: "interested", work_style: "full_remote" }

    assert_response :success

    body = JSON.parse(response.body)

    assert_equal 1, body["jobs"].length
    assert_equal @job1.id, body["jobs"].first["id"]
    assert_equal 1, body["meta"]["total_count"]
    assert_equal 1, body["meta"]["page"]
  end

  test "index sorts jobs by salary_max ascending" do
    get "/api/jobs", params: { sort: "salary_max", direction: "asc" }

    assert_response :success

    body = JSON.parse(response.body)

    assert_equal [@job1.id, @job2.id], body["jobs"].map { |job| job["id"] }
  end

  test "update changes status and returns updated job" do
    patch "/api/jobs/#{@job1.id}", params: { job: { status: "interviewing" } }, as: :json

    assert_response :success

    body = JSON.parse(response.body)

    assert_equal "interviewing", body["status"]
    assert_equal "interviewing", @job1.reload.status
  end

  test "create persists a new job" do
    assert_difference("Job.count", 1) do
      post "/api/jobs",
        params: {
          job: {
            company_name: "サンプル会社 C",
            position: "テックリード",
            status: "applied",
            work_style: "onsite",
            employment_type: "full_time",
            salary_min: 6_000_000,
            salary_max: 8_000_000,
            tech_stack: "Go, React",
            location: "福岡",
            notes: "新規追加"
          }
        },
        as: :json
    end

    assert_response :created

    body = JSON.parse(response.body)

    assert_equal "サンプル会社 C", body["company_name"]
    assert_equal "テックリード", body["position"]
    assert_equal "applied", body["status"]
  end

  test "create allows blank notes" do
    assert_difference("Job.count", 1) do
      post "/api/jobs",
        params: {
          job: {
            company_name: "サンプル会社 D",
            position: "バックエンドエンジニア",
            status: "interested",
            work_style: "hybrid",
            employment_type: "full_time",
            salary_min: 5_000_000,
            salary_max: 6_500_000,
            tech_stack: "Rails",
            location: "東京",
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
            position: "",
            status: "interested",
            work_style: "hybrid",
            employment_type: "full_time",
            salary_min: 6_000_000,
            salary_max: 5_000_000,
            tech_stack: "",
            location: "",
            notes: ""
          }
        },
        as: :json
    end

    assert_response :unprocessable_entity

    body = JSON.parse(response.body)

    assert_includes body["errors"], "Company name can't be blank"
    assert_includes body["errors"], "Position can't be blank"
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
end
