require "test_helper"

class ScoringPreferencesApiTest < ActionDispatch::IntegrationTest
  setup do
    JobTechStack.delete_all
    Job.delete_all
    Location.delete_all
    Position.delete_all
    TechStack.delete_all
    ScoringPreference.delete_all

    location = Location.create!(name: "東京", score_weight: 6, active: true, display_order: 0)
    position = Position.create!(name: "バックエンドエンジニア", score_weight: 8, active: true, display_order: 0)
    rails = TechStack.create!(name: "Ruby on Rails", score_weight: 20, active: true, display_order: 0)
    typescript = TechStack.create!(name: "TypeScript", score_weight: 15, active: true, display_order: 1)

    @job = Job.new(
      company_name: "サンプル会社 A",
      position: position,
      status: "interested",
      work_style: "full_remote",
      employment_type: "full_time",
      salary_min: 4_500_000,
      salary_max: 8_500_000,
      location: location,
      notes: ""
    )
    @job.tech_stacks = [ rails, typescript ]
    @job.save!
  end

  test "show returns current scoring preference" do
    get "/api/scoring_preference"

    assert_response :success
    body = JSON.parse(response.body)

    assert_equal 30, body["full_remote_weight"]
    assert_equal 0, body["onsite_weight"]
    assert_equal 10, body["high_salary_bonus"]
  end

  test "update recalculates existing job scores" do
    patch "/api/scoring_preference",
      params: {
        scoring_preference: {
          full_remote_weight: 50,
          high_salary_bonus: 20
        }
      },
      as: :json

    assert_response :success
    assert_equal 119, @job.reload.score
  end
end
