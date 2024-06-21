class ContainersController < ApplicationController
  before_action :set_container, only: [:show, :edit, :update, :destroy]

  def index
    containers = Container.all
    render json: containers
  end

  def show
    render json: @container
  end

  def create
    user = find_user_by_session_id
    container = user.containers.create!(container_params)
    render json: container, status: :created
  end

  def update
   user = find_user_by_session_id
   container = user.containers.find(params[:id])
   container.update!(container_params)
   render json: container, status: :accepted
  end

  def destroy
    user = find_user_by_session_id
    container = user.containers.find(params[:id])
    container.destroy
    render json: container, status: :no_content
  end

  private

  def find_user_by_session_id
      User.find_by(id: session[:user_id])
  end

  def set_container
    @container = Container.find(params[:id])
  end

  def container_params
    params.permit(:user_id, :shelf, :row)
  end
end
