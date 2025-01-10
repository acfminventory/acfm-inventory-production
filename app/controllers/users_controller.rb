class UsersController < ApplicationController
    # skip_before_action :authorize, only: [:create]

    def index
        render json: User.all
    end

    def show
        user = User.includes(:teams, containers: :contents).find_by(id: session[:user_id])
        if user
            render json: user, include: [:teams, {containers: :contents }], status: :ok
        else
            render json: { error: "User not found" }, status: :not_found
        end
    end


    def create
        user = User.create!(user_params)
        session[:user_id] = user.id
        render json: user, status: :created
    end

    private

    def find_user
        User.find(params[:id])
    end

    def user_params
        params.permit(
            :username, 
            :password
        )
    end
end
