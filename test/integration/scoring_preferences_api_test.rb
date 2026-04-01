require "test_helper"

class ScoringPreferencesApiTest < ActionDispatch::IntegrationTest
  setup do
    Job.delete_all
    ScoringPreference.delete_all

    @job = Job.create!(
      company_name: "サンプル会社 A",
      position: "バックエンドエンジニア",
      status: "interested",
      work_style: "full_remote",
      employment_type: "full_time",
      salary_min: 4_500_000,
      salary_max: 8_500_000,
      tech_stack: "Ruby on Rails, TypeScript",
      location: "東京",
      notes: ""
    )
  end

  test "show returns current scoring preference" do
    get "/api/scoring_preference"

    assert_response :success
    body = JSON.parse(response.body)

    assert_equal 30, body["full_remote_weight"]
    assert_equal 20, body["rails_weight"]
  end

  test "update recalculates existing job scores" do
    patch "/api/scoring_preference",
      params: {
        scoring_preference: {
          full_remote_weight: 50,
          rails_weight: 5,
          typescript_weight: 0,
          high_salary_bonus: 20
        }
      },
      as: :json

    assert_response :success
    assert_equal 75, @job.reload.score
  end
end
