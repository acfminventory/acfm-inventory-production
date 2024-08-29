class AddUserIdToTeams < ActiveRecord::Migration[6.0]
  def change
    add_column :teams, :user_id, :integer
    add_index :teams, :user_id
  end
end
