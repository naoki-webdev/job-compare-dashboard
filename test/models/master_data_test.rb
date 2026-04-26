require "test_helper"

class PositionTest < ActiveSupport::TestCase
  setup do
    JobTechStack.delete_all
    Job.delete_all
    Location.delete_all
    Position.delete_all
    TechStack.delete_all
    ScoringPreference.delete_all
  end

  test "validates name uniqueness" do
    Position.create!(name: "バックエンドエンジニア", score_weight: 8, active: true, display_order: 0)
    position = Position.new(name: "バックエンドエンジニア", score_weight: 5, active: true, display_order: 1)

    assert_not position.valid?
    assert_includes position.errors[:name], "has already been taken"
  end

  test "refreshes related job scores after update" do
    location = Location.create!(name: "東京", score_weight: 6, active: true, display_order: 0)
    position = Position.create!(name: "バックエンドエンジニア", score_weight: 8, active: true, display_order: 0)
    rails = TechStack.create!(name: "Ruby on Rails", score_weight: 20, active: true, display_order: 0)
    ScoringPreference.create!

    job = Job.new(
      company_name: "サンプル会社",
      position: position,
      status: "interested",
      work_style: "hybrid",
      employment_type: "full_time",
      salary_min: 5_000_000,
      salary_max: 7_000_000,
      location: location,
      notes: ""
    )
    job.tech_stacks = [ rails ]
    job.save!

    position.update!(score_weight: 20)

    assert_equal 61, job.reload.score
  end

  test "does not touch related jobs when only non-score fields change" do
    location = Location.create!(name: "東京", score_weight: 6, active: true, display_order: 0)
    position = Position.create!(name: "バックエンドエンジニア", score_weight: 8, active: true, display_order: 0)
    rails = TechStack.create!(name: "Ruby on Rails", score_weight: 20, active: true, display_order: 0)
    ScoringPreference.create!

    job = Job.new(
      company_name: "サンプル会社",
      position: position,
      status: "interested",
      work_style: "hybrid",
      employment_type: "full_time",
      salary_min: 5_000_000,
      salary_max: 7_000_000,
      location: location,
      notes: ""
    )
    job.tech_stacks = [ rails ]
    job.save!

    previous_updated_at = 3.days.ago.change(usec: 0)
    job.update_column(:updated_at, previous_updated_at)

    position.update!(name: "バックエンドアーキテクト")

    assert_equal previous_updated_at.to_i, job.reload.updated_at.to_i
  end
end

class LocationTest < ActiveSupport::TestCase
  setup do
    JobTechStack.delete_all
    Job.delete_all
    Location.delete_all
    Position.delete_all
    TechStack.delete_all
    ScoringPreference.delete_all
  end

  test "ordered scope sorts by display_order then id" do
    second = Location.create!(name: "大阪", score_weight: 4, active: true, display_order: 1)
    first = Location.create!(name: "東京", score_weight: 6, active: true, display_order: 0)

    assert_equal [ first.id, second.id ], Location.ordered.pluck(:id)
  end

  test "does not refresh related jobs when only non-score fields change" do
    location = Location.create!(name: "東京", score_weight: 6, active: true, display_order: 0)
    position = Position.create!(name: "バックエンドエンジニア", score_weight: 8, active: true, display_order: 0)
    rails = TechStack.create!(name: "Ruby on Rails", score_weight: 20, active: true, display_order: 0)
    ScoringPreference.create!

    job = Job.new(
      company_name: "サンプル会社",
      position: position,
      status: "interested",
      work_style: "hybrid",
      employment_type: "full_time",
      salary_min: 5_000_000,
      salary_max: 7_000_000,
      location: location,
      notes: ""
    )
    job.tech_stacks = [ rails ]
    job.save!

    previous_updated_at = 3.days.ago.change(usec: 0)
    job.update_column(:updated_at, previous_updated_at)

    location.update!(name: "東京本社")

    assert_equal previous_updated_at.to_i, job.reload.updated_at.to_i
  end
end

class TechStackTest < ActiveSupport::TestCase
  setup do
    JobTechStack.delete_all
    Job.delete_all
    Location.delete_all
    Position.delete_all
    TechStack.delete_all
    ScoringPreference.delete_all
  end

  test "active scope returns only active records" do
    active_stack = TechStack.create!(name: "Rails", score_weight: 20, active: true, display_order: 0)
    TechStack.create!(name: "Vue.js", score_weight: 5, active: false, display_order: 1)

    assert_equal [ active_stack.id ], TechStack.active.pluck(:id)
  end

  test "refreshes related job scores after update" do
    location = Location.create!(name: "東京", score_weight: 6, active: true, display_order: 0)
    position = Position.create!(name: "バックエンドエンジニア", score_weight: 8, active: true, display_order: 0)
    tech_stack = TechStack.create!(name: "Rails", score_weight: 20, active: true, display_order: 0)
    ScoringPreference.create!

    job = Job.new(
      company_name: "サンプル会社",
      position: position,
      status: "interested",
      work_style: "hybrid",
      employment_type: "full_time",
      salary_min: 5_000_000,
      salary_max: 7_000_000,
      location: location,
      notes: ""
    )
    job.tech_stacks = [ tech_stack ]
    job.save!

    tech_stack.update!(score_weight: 30)

    assert_equal 59, job.reload.score
  end

  test "does not refresh related jobs when only non-score fields change" do
    location = Location.create!(name: "東京", score_weight: 6, active: true, display_order: 0)
    position = Position.create!(name: "バックエンドエンジニア", score_weight: 8, active: true, display_order: 0)
    tech_stack = TechStack.create!(name: "Rails", score_weight: 20, active: true, display_order: 0)
    ScoringPreference.create!

    job = Job.new(
      company_name: "サンプル会社",
      position: position,
      status: "interested",
      work_style: "hybrid",
      employment_type: "full_time",
      salary_min: 5_000_000,
      salary_max: 7_000_000,
      location: location,
      notes: ""
    )
    job.tech_stacks = [ tech_stack ]
    job.save!

    previous_updated_at = 3.days.ago.change(usec: 0)
    job.update_column(:updated_at, previous_updated_at)

    tech_stack.update!(name: "Ruby on Rails")

    assert_equal previous_updated_at.to_i, job.reload.updated_at.to_i
  end
end

class JobTechStackTest < ActiveSupport::TestCase
  setup do
    JobTechStack.delete_all
    Job.delete_all
    Location.delete_all
    Position.delete_all
    TechStack.delete_all
    ScoringPreference.delete_all

    location = Location.create!(name: "東京", score_weight: 6, active: true, display_order: 0)
    position = Position.create!(name: "バックエンドエンジニア", score_weight: 8, active: true, display_order: 0)
    @tech_stack = TechStack.create!(name: "Rails", score_weight: 20, active: true, display_order: 0)
    ScoringPreference.create!

    @job = Job.new(
      company_name: "サンプル会社",
      position: position,
      status: "interested",
      work_style: "hybrid",
      employment_type: "full_time",
      salary_min: 5_000_000,
      salary_max: 7_000_000,
      location: location,
      notes: ""
    )
    @job.tech_stacks = [ @tech_stack ]
    @job.save!
  end

  test "validates uniqueness of tech stack per job" do
    duplicate = JobTechStack.new(job: @job, tech_stack: @tech_stack)

    assert_not duplicate.valid?
    assert_includes duplicate.errors[:job_id], "has already been taken"
  end
end
