require "test_helper"

class TechStacksApiTest < ActionDispatch::IntegrationTest
  setup do
    JobTechStack.delete_all
    Job.delete_all
    Location.delete_all
    Position.delete_all
    TechStack.delete_all

    @tech_stack = TechStack.create!(name: "Ruby on Rails", score_weight: 20, active: true, display_order: 1)
    @other_tech_stack = TechStack.create!(name: "TypeScript", score_weight: 15, active: true, display_order: 0)
  end

  test "index returns tech stacks ordered by display_order" do
    get "/api/tech_stacks"

    assert_response :success

    body = JSON.parse(response.body)

    assert_equal [ @other_tech_stack.id, @tech_stack.id ], body.map { |item| item["id"] }
  end

  test "create persists a new tech stack" do
    assert_difference("TechStack.count", 1) do
      post "/api/tech_stacks",
        params: { tech_stack: { name: "React", score_weight: 8, active: true, display_order: 2 } },
        as: :json
    end

    assert_response :created
    assert_equal "React", JSON.parse(response.body)["name"]
  end

  test "update changes an existing tech stack" do
    patch "/api/tech_stacks/#{@tech_stack.id}",
      params: { tech_stack: { name: "Rails", score_weight: 18, active: false, display_order: 3 } },
      as: :json

    assert_response :success

    body = JSON.parse(response.body)
    assert_equal "Rails", body["name"]
    assert_equal false, body["active"]
    assert_equal 18, @tech_stack.reload.score_weight
  end

  test "destroy removes an unused tech stack" do
    assert_difference("TechStack.count", -1) do
      delete "/api/tech_stacks/#{@other_tech_stack.id}"
    end

    assert_response :no_content
  end

  test "destroy deactivates a tech stack when jobs still reference it" do
    location = Location.create!(name: "東京", score_weight: 6, active: true, display_order: 0)
    position = Position.create!(name: "バックエンドエンジニア", score_weight: 8, active: true, display_order: 0)
    job = Job.new(
      company_name: "参照中の会社",
      position: position,
      status: "interested",
      work_style: "full_remote",
      employment_type: "full_time",
      salary_min: 5_000_000,
      salary_max: 7_000_000,
      location: location
    )
    job.tech_stacks = [ @tech_stack ]
    job.save!

    assert_no_difference("TechStack.count") do
      delete "/api/tech_stacks/#{@tech_stack.id}"
    end

    assert_response :success
    assert_equal false, @tech_stack.reload.active
    assert_equal false, JSON.parse(response.body)["active"]
  end
end
