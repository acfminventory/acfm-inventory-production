class CreationLogsController < ApplicationController

  def index
    creation_logs = CreationLog.includes(:team, :container)
    render json: creation_logs
  end

  def show
    creation_log = CreationLog.find(params[:id]) 
    render json: creation_log, status: :ok
  end

  def create
    creation_log = CreationLog.create!(creation_log_params)
    render json: creation_log, status: :created
  end

  def update
    creation_log = CreationLog.find(params[:id])
    creation_log.update!(creation_log_params)
    render json: creation_log, status: :ok
  end

  def destroy
    creation_log = CreationLog.find(params[:id])
    creation_log.destroy
    render json: creation_log, status: :no_content
  end

  private

  def creation_log_params
    params.require(:creation_log).permit(:team_id, :container_id)
  end

end
