/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('request_queue',(t)=>{
      t.string("own_vehicle_no").defaultTo(null);
    })
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function(knex) {
    return knex.schema.alterTable('request_queue',t=>{
        t.dropColumn('own_vehicle_no')
    });
  };
  