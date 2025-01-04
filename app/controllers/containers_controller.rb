class ContainersController < ApplicationController
  before_action :find_user_by_session_id
  before_action :set_container, only: [:show, :update, :destroy]

  def index
    containers = @user.containers.includes(:contents)
    render json: containers, include: :contents
  end

  def show
    render json: @container, include: :contents
  end

  def create
    team = @user.teams.find_by(id: container_params[:team_id])
    
    # Get the quantity of containers to create
    quantity = (container_params[:quantity] || 1).to_i # Default to 1 if not provided
    quantity = [quantity, 3].min # Ensure quantity does not exceed 3

    # Create the specified number of containers
    containers = []
    quantity.times do
      container = team.containers.create!(container_params.except(:team_id, :quantity))
      CreationLog.create!(
        container: container,
        team: team,
        created_at: container.created_at
      )
      containers << container
    end

    render json: containers, status: :created
  end


  def update
    new_team = params[:container][:team_id].present? ? Team.find(params[:container][:team_id]) : nil
    old_team = @container.team

    @container.update!(container_params.merge(team: new_team))
      if new_team != old_team
        # Update CreationLog if the team has changed
        CreationLog.find_by(container: @container)&.update(
          team: new_team,
          created_at: @container.created_at
        )
      end
    render json: @container
  end

  def destroy
    # Check if the container belongs to the current user
    if @user.containers.include?(@container)
      @container.destroy
      head :no_content
    else
      render json: { error: 'Unauthorized to delete this container' }, status: :forbidden
    end
  end

  private

  def find_user_by_session_id
    @user = User.find_by(id: session[:user_id])
    if @user.nil?
      Rails.logger.debug "User not found with session_id: #{session[:user_id]}"
      head :unauthorized
    end
  end

  def container_params
      params.require(:container).permit(:shelf, :row, :expires, :team_id, :quantity, contents_attributes: [:id, :product_id, :concentration, :_destroy])
  end


  def set_container
    @container = @user.containers.find(params[:id])
  end
end
