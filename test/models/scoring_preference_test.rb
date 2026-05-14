require "test_helper"

class ScoringPreferenceTest < ActiveSupport::TestCase
  setup do
    JobTechStack.delete_all
    Job.delete_all
    Location.delete_all
    Position.delete_all
    TechStack.delete_all
    ScoringPreference.delete_all
    PositiveKeyword.delete_all
    NegativeKeyword.delete_all
    InterviewQuestion.delete_all
    ActivityLog.delete_all
    User.delete_all

    @user = create_user(email: "scoring-model@example.com")
  end

  test "current creates a default preference when none exists" do
    preference = ScoringPreference.current(user: @user)

    assert preference.persisted?
    assert_equal 30, preference.full_remote_weight
    assert_equal 1, ScoringPreference.count
  end

  test "validates non negative thresholds" do
    preference = ScoringPreference.new(
      user: @user,
      high_salary_max_threshold: -1,
      low_salary_min_threshold: -1
    )

    assert_not preference.valid?
    assert_includes preference.errors[:high_salary_max_threshold], "must be greater than or equal to 0"
    assert_includes preference.errors[:low_salary_min_threshold], "must be greater than or equal to 0"
  end

  test "recalculates existing job scores after update" do
    location = Location.create!(name: "東京", score_weight: 6, active: true, display_order: 0)
    position = Position.create!(name: "バックエンドエンジニア", score_weight: 8, active: true, display_order: 0)
    rails = TechStack.create!(name: "Rails", score_weight: 20, active: true, display_order: 0)
    preference = ScoringPreference.create!(user: @user)

    job = Job.new(
      user: @user,
      company_name: "サンプル会社",
      position: position,
      status: "interested",
      work_style: "full_remote",
      employment_type: "full_time",
      salary_min: 5_000_000,
      salary_max: 7_000_000,
      location: location,
      notes: ""
    )
    job.tech_stacks = [ rails ]
    job.save!

    preference.update!(full_remote_weight: 50)

    assert_equal 84, job.reload.score
  end
end
