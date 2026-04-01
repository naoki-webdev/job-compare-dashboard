Rails.application.routes.draw do
  namespace :api do
    get "jobs/export", to: "jobs#export"
    resource :scoring_preference, only: [:show, :update]
    resources :jobs, only: [:index, :show, :create, :update, :destroy]
  end
end
