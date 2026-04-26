module Api
  class JobsController < ApplicationController
    before_action :set_job, only: [ :show, :update, :destroy ]

    def index
      query = JobsQuery.new(params: params)
      jobs = query.results.includes(:position, :location, :tech_stacks).with_attached_company_logo

      render json: {
        jobs: JobSerializer.collection(jobs, url_options: url_options),
        meta: {
          page: query.page,
          per_page: query.per_page,
          total_count: query.total_count,
          summary: query.summary
        }
      }
    end

    def show
      render json: JobSerializer.new(@job, url_options: url_options).as_json
    end

    def create
      job = Job.new(base_job_params)
      assign_master_relations(job)
      attach_company_logo(job)

      if job.save
        render json: JobSerializer.new(job, url_options: url_options).as_json, status: :created
      else
        render json: { errors: job.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      remove_company_logo = remove_company_logo_requested?

      Job.transaction do
        @job.assign_attributes(base_job_params)
        assign_master_relations(@job)
        attach_company_logo(@job)
        @job.save!
      end
      purge_company_logo(@job) if remove_company_logo

      render json: JobSerializer.new(@job, url_options: url_options).as_json
    rescue ActiveRecord::RecordInvalid
      render json: { errors: @job.errors.full_messages }, status: :unprocessable_entity
    end

    def destroy
      @job.destroy!
      head :no_content
    end

    def export
      query = JobsQuery.new(params: params)
      jobs = query.export_scope.preload(:position, :location, :tech_stacks)
      exporter = JobsCsvExport.new(jobs)

      send_data exporter.call,
        filename: exporter.filename,
        type: "text/csv; charset=utf-8"
    end

    private

    def set_job
      @job = Job.includes(:position, :location, :tech_stacks).with_attached_company_logo.find(params[:id])
    end

    def job_params
      params.require(:job)
    end

    def base_job_params
      job_params.permit(
        :company_name,
        :position_id,
        :status,
        :work_style,
        :employment_type,
        :salary_min,
        :salary_max,
        :location_id,
        :notes
      )
    end

    def company_logo_param
      job_params[:company_logo]
    end

    def attach_company_logo(job)
      return if company_logo_param.blank?

      job.company_logo.attach(company_logo_param)
    end

    def remove_company_logo_requested?
      return if company_logo_param.present?

      ActiveModel::Type::Boolean.new.cast(job_params[:remove_company_logo])
    end

    def purge_company_logo(job)
      job.company_logo.purge
    end

    def tech_stack_ids
      job_params.fetch(:tech_stack_ids, []).map(&:to_i).uniq
    end

    def assign_master_relations(job)
      return unless job_params.key?(:tech_stack_ids)

      job.tech_stacks = TechStack.where(id: tech_stack_ids)
    end

    def url_options
      { host: request.host_with_port, protocol: request.protocol }
    end
  end
end
