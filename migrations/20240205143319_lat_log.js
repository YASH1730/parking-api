/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('parking',(t)=>{
      t.float("latitude").defaultTo(null);
      t.float("longitude").defaultTo(null);
    })
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.alterTable('parking',t=>{
        t.dropColumn('latitude')
        t.dropColumn('longitude')
    });
  };
  