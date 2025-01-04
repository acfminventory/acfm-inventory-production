class TeamsController < ApplicationController

  def index
    render json: Team.all
  end

  def show
    @team = Team.includes(:contents).find(params[:id])
    render json: @team
  end


  def create
    team = Team.create!(team_params)
    render json: team, status: :created
  end

  def update
    team = Team.find(params[:id])
    team.update!(team_params)
    render json: team, status: :ok
  end

  def destroy
    team = Team.find(params[:id])
    team.destroy
    render json: team, status: :no_content
  end

  private

  def team_params
    params.require(:team).permit(:name, :user_id)
  end

end
