class Job < ApplicationRecord
  enum :status, {
    interested: "interested",
    applied: "applied",
    interviewing: "interviewing",
    offer: "offer",
    rejected: "rejected"
  }, validate: true

  enum :work_style, {
    full_remote: "full_remote",
    hybrid: "hybrid",
    onsite: "onsite"
  }, validate: true

  enum :employment_type, {
    full_time: "full_time",
    contract: "contract"
  }, validate: true

  validates :company_name, presence: true
  validates :position, presence: true
  validates :status, presence: true
  validates :work_style, presence: true
  validates :employment_type, presence: true
  validates :salary_min, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :salary_max, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :salary_max, numericality: { greater_than_or_equal_to: :salary_min }
  validates :tech_stack, presence: true
  validates :location, presence: true

  before_validation :set_score

  private

  def set_score
    self.score = calculated_score
  end

  def calculated_score
    preference = ScoringPreference.current
    total = 0

    total += preference.full_remote_weight if full_remote?
    total += preference.hybrid_weight if hybrid?
    total += preference.onsite_weight if onsite?

    downcased_stack = tech_stack.to_s.downcase
    total += preference.rails_weight if downcased_stack.include?("rails")
    total += preference.typescript_weight if downcased_stack.include?("typescript")

    total += preference.high_salary_bonus if salary_max.to_i >= preference.high_salary_max_threshold
    total += preference.low_salary_penalty if salary_min.to_i < preference.low_salary_min_threshold

    total
  end
end
