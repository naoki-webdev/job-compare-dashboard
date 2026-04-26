module Api
  class MasterDataController < ApplicationController
    FIELDS = %w[id name score_weight active display_order].freeze

    def index
      render json: model_class.ordered.as_json(only: FIELDS)
    end

    def create
      record = model_class.new(master_data_params)

      if record.save
        render json: serialize(record), status: :created
      else
        render json: { errors: record.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      record = model_class.find(params[:id])

      if record.update(master_data_params)
        render json: serialize(record)
      else
        render json: { errors: record.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      record = model_class.find(params[:id])

      if record.jobs.exists?
        record.update!(active: false)
        render json: serialize(record)
      else
        record.destroy!
        head :no_content
      end
    end

    private

    def serialize(record)
      record.as_json(only: FIELDS)
    end

    def master_data_params
      params.require(resource_name).permit(:name, :score_weight, :active, :display_order)
    end

    def model_class
      raise NotImplementedError
    end

    def resource_name
      raise NotImplementedError
    end
  end
end
