require "csv"

module Api
  class JobsController < ApplicationController
    CSV_UTF8_BOM = "\uFEFF"
    SORT_COLUMNS = %w[
      id company_name position status work_style employment_type
      salary_min salary_max score created_at updated_at
    ].freeze
    SORT_DIRECTIONS = %w[asc desc].freeze
    DEFAULT_PER_PAGE = 20
    MAX_PER_PAGE = 100

    before_action :set_job, only: [:show, :update, :destroy]

    def index
      jobs = filtered_jobs
      page = normalized_page
      per_page = normalized_per_page
      total_count = jobs.count

      jobs = jobs.order("#{sort_column} #{sort_direction}")
      jobs = jobs.offset((page - 1) * per_page).limit(per_page)

      render json: {
        jobs: jobs.as_json(only: response_fields),
        meta: {
          page: page,
          per_page: per_page,
          total_count: total_count
        }
      }
    end

    def show
      render json: @job.as_json(only: response_fields)
    end

    def create
      job = Job.new(job_params)

      if job.save
        render json: job.as_json(only: response_fields), status: :created
      else
        render json: { errors: job.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      if @job.update(job_params)
        render json: @job.as_json(only: response_fields)
      else
        render json: { errors: @job.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      @job.destroy!
      head :no_content
    end

    def export
      jobs = filtered_jobs.order("#{sort_column} #{sort_direction}")

      csv = I18n.with_locale(export_locale) do
        CSV.generate(headers: true) do |rows|
          rows << csv_headers

          jobs.each do |job|
            rows << csv_row(job)
          end
        end
      end

      send_data "#{CSV_UTF8_BOM}#{csv}",
        filename: "jobs-#{Time.current.strftime("%Y%m%d%H%M%S")}.csv",
        type: "text/csv; charset=utf-8"
    end

    private

    def set_job
      @job = Job.find(params[:id])
    end

    def filtered_jobs
      scope = Job.all

      keyword = params[:keyword].to_s.strip
      if keyword.present?
        escaped_keyword = Job.sanitize_sql_like(keyword)
        scope = scope.where(
          "company_name ILIKE :keyword OR position ILIKE :keyword OR tech_stack ILIKE :keyword OR location ILIKE :keyword OR notes ILIKE :keyword",
          keyword: "%#{escaped_keyword}%"
        )
      end

      statuses = params[:status].to_s.split(",").map(&:strip).reject(&:empty?)
      work_styles = params[:work_style].to_s.split(",").map(&:strip).reject(&:empty?)

      scope = scope.where(status: statuses) if statuses.any?
      scope = scope.where(work_style: work_styles) if work_styles.any?

      scope
    end

    def job_params
      params.require(:job).permit(
        :company_name,
        :position,
        :status,
        :work_style,
        :employment_type,
        :salary_min,
        :salary_max,
        :tech_stack,
        :location,
        :notes
      )
    end

    def sort_column
      column = params[:sort].to_s
      SORT_COLUMNS.include?(column) ? column : "updated_at"
    end

    def sort_direction
      direction = params[:direction].to_s.downcase
      SORT_DIRECTIONS.include?(direction) ? direction : "desc"
    end

    def normalized_page
      page = params[:page].to_i
      page > 0 ? page : 1
    end

    def normalized_per_page
      per_page = params[:per_page].to_i
      return DEFAULT_PER_PAGE if per_page <= 0

      [per_page, MAX_PER_PAGE].min
    end

    def response_fields
      %w[
        id company_name position status work_style employment_type
        salary_min salary_max tech_stack location notes score created_at updated_at
      ]
    end

    def export_locale
      I18n.available_locales.include?(:ja) ? :ja : I18n.default_locale
    end

    def csv_headers
      response_fields.map do |field|
        I18n.t("csv.headers.#{field}", default: field)
      end
    end

    def csv_row(job)
      response_fields.map do |field|
        csv_value(job, field)
      end
    end

    def csv_value(job, field)
      value = job.public_send(field)

      case field
      when "status", "work_style", "employment_type"
        I18n.t("csv.enums.#{field}.#{value}", default: value)
      when "created_at", "updated_at"
        I18n.l(value.in_time_zone("Asia/Tokyo"), format: :csv)
      else
        value
      end
    end
  end
end
