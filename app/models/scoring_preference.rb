class ScoringPreference < ApplicationRecord
  validates :full_remote_weight, :hybrid_weight, :onsite_weight, presence: true
  validates :rails_weight, :typescript_weight, presence: true
  validates :high_salary_max_threshold, :high_salary_bonus, presence: true
  validates :low_salary_min_threshold, :low_salary_penalty, presence: true
  validates :high_salary_max_threshold, :low_salary_min_threshold, numericality: { greater_than_or_equal_to: 0 }

  after_commit :recalculate_job_scores!, on: :update

  def self.current
    first_or_create!
  end

  private

  def recalculate_job_scores!
    Job.find_each(&:save!)
  end
end
