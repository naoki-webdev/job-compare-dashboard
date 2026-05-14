class Location < ApplicationRecord
  include MasterDataRecord

  has_many :jobs, dependent: :restrict_with_error
end
