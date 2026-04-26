module Api
  class ScoringPreferencesController < ApplicationController
    def show
      render json: ScoringPreference.current
    end

    def update
      preference = ScoringPreference.current

      if preference.update(scoring_preference_params)
        render json: preference
      else
        render json: { errors: preference.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    def scoring_preference_params
      params.require(:scoring_preference).permit(
        :full_remote_weight,
        :hybrid_weight,
        :onsite_weight,
        :high_salary_max_threshold,
        :high_salary_bonus,
        :low_salary_min_threshold,
        :low_salary_penalty
      )
    end
  end
end
