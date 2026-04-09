DELETE FROM chrp_archive;
DELETE FROM abc_data;
DELETE FROM oil_loss;
DELETE FROM n_wincctags;
DELETE FROM n_lenta;
DELETE FROM n_last10;
DELETE FROM n_2hour_arch;
DELETE FROM n_2hour;
DELETE FROM well_data;
DELETE FROM n_well_matrix;
DELETE FROM n_users;

INSERT INTO n_users (id, login, name, password, is_admin, available_ngdu_id, is_geolog) VALUES
  (1, 'user_test', 'QA Test User', '96b33694c4bb7dbd07391e0be54745fb', 0, 1, 0),
  (2, 'admin_test', 'QA Admin User', '0192023a7bbd73250516f069df18b500', 1, 1, 0);

INSERT INTO n_well_matrix (
  well, oil_field, nagn, tr_fluid, tr_oil, zamer, zamer_oil, status, type, agzu, gas, water_tm, update_date
) VALUES
  ('BSK_0001', 'BSK', 0, 120.00, 60.00, 115.00, 56.00, 'В работе', 1, 'АГЗУ-1', 18.00, 35.00, NOW()),
  ('BSK_0002', 'BSK', 0, 140.00, 70.00, 138.00, 68.00, 'В простое', 1, 'АГЗУ-1', 22.00, 40.00, NOW()),
  ('BSK_1001', 'BSK', 1, 250.00, 0.00, 245.00, 0.00, 'В работе', 1, 'АГЗУ-2', 0.00, 0.00, NOW());

INSERT INTO well_data (
  well, coordinates_x, coordinates_y, c_voltage, c_power, c_freq, c_current,
  c_current_min, c_current_max, c_speed, c_temp, c_type, c_last_update, working, type
) VALUES
  ('BSK_0001', '47.1123', '53.9021', 380.00, 27.20, 50.00, 16.50, 10.00, 30.00, 1450.00, 48.50, 'SCHNEIDER', NOW(), 1, 1),
  ('BSK_0002', '47.1130', '53.9030', 379.00, 18.60, 49.90, 0.60, 10.00, 30.00, 1430.00, 44.00, 'SVX-100', NOW(), 1, 1),
  ('BSK_1001', '47.1200', '53.9100', 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 'INJECTION', NOW(), 1, 1);

INSERT INTO n_2hour (
  oil_field, current_debit, tech_rezh, debit_last_day, current_debit_nak, tech_rezh_nak, debit_last_day_nak,
  n_current_debit, n_tech_rezh, n_debit_last_day, n_current_debit_nak, n_tech_rezh_nak, n_debit_last_day_nak,
  wat_out, time, Tin
) VALUES
  ('BSK', 110, 120, 112, 110, 120, 112, 52, 60, 54, 52, 60, 54, 20, '1:59', 1),
  ('BSK', 112, 121, 113, 222, 241, 225, 53, 61, 55, 105, 121, 109, 22, '3:59', 1),
  ('BSK', 113, 122, 114, 335, 363, 339, 54, 61, 56, 159, 182, 165, 23, '5:59', 1),
  ('BSK', 114, 122, 114, 449, 485, 453, 54, 62, 56, 213, 244, 221, 21, '7:59', 1),
  ('BSK', 115, 123, 115, 564, 608, 568, 55, 62, 57, 268, 306, 278, 25, '9:59', 1),
  ('BSK', 116, 123, 115, 680, 731, 683, 55, 63, 57, 323, 369, 335, 24, '11:59', 0),
  ('BSK', 117, 124, 116, 797, 855, 799, 56, 63, 58, 379, 432, 393, 26, '13:59', 0),
  ('BSK', 118, 124, 117, 915, 979, 916, 57, 64, 58, 436, 496, 451, 27, '15:59', 1),
  ('BSK', 119, 125, 118, 1034, 1104, 1034, 58, 64, 59, 494, 560, 510, 29, '17:59', 1),
  ('BSK', 120, 125, 118, 1154, 1229, 1152, 58, 65, 59, 552, 625, 569, 28, '19:59', 1),
  ('BSK', 121, 126, 119, 1275, 1355, 1271, 59, 65, 60, 611, 690, 629, 30, '21:59', 1),
  ('BSK', 122, 126, 120, 1397, 1481, 1391, 60, 66, 61, 671, 756, 690, 31, '23:59', 1),
  ('BSK', 123, 127, 120, 1520, 1608, 1511, 60, 66, 61, 731, 822, 751, 32, '00:59', 1);

INSERT INTO n_2hour_arch (
  oil_field, date, time, current_debit, tech_rezh, debit_last_day,
  current_debit_nak, tech_rezh_nak, debit_last_day_nak,
  n_current_debit, n_tech_rezh, n_debit_last_day,
  n_current_debit_nak, n_tech_rezh_nak, n_debit_last_day_nak
) VALUES
  ('BSK', '2025-01-15', '01:59', 100, 120, 110, 100, 120, 110, 50, 60, 55, 50, 60, 55),
  ('BSK', '2025-01-15', '03:59', 102, 121, 111, 202, 241, 221, 51, 61, 56, 101, 121, 111),
  ('BSK', '2025-01-15', '05:59', 104, 122, 112, 306, 363, 333, 52, 62, 57, 153, 183, 168),
  ('BSK', '2025-01-15', '07:59', 106, 123, 113, 412, 486, 446, 53, 63, 58, 206, 246, 226),
  ('BSK', '2025-01-14', '01:59', 95, 116, 105, 95, 116, 105, 48, 58, 52, 48, 58, 52);

INSERT INTO n_last10 (well, start_date, end_date, work) VALUES
  ('BSK_0001', '2025-01-01', '2025-01-05', 'ППД'),
  ('BSK_0002', '2025-01-07', '2025-01-09', 'КРС');

INSERT INTO n_lenta (
  criticality, extraction, event, status, oil_field, agzu, well, otvod, opened, user_name, user_email, delta, comment
) VALUES
  ('low', 'production', 'Плановое уведомление', 'closed', 'BSK', 'АГЗУ-1', 'BSK_0001', '1', NOW(), 'qa-bot', 'qa@example.com', 0.00, 'seed');

INSERT INTO n_wincctags (oil_field, description, tag_key, tag_value, vlog_arch) VALUES
  ('BSK', 'well number', 'well_num', '5', NOW()),
  ('BSK', 'AGZU1 current', 'agzu_1_current_1', '12.5', NOW()),
  ('BSK', 'AGZU1 pressure', 'agzu_1_sep_pressure_1', '8.2', NOW()),
  ('BSK', 'AGZU1 pass time', 'agzu_1_pass_time_1', '120', NOW()),
  ('BSK', 'AGZU1 temp', 'agzu_1_liq_temp_1', '37.4', NOW()),
  ('BSK', 'progress', 'progress_oil', '1', NOW());

INSERT INTO abc_data (well, date, tm_fluid, tm_oil, tm_water) VALUES
  ('BSK_0001', '2025-01-15', 110.2, 55.3, 48.7),
  ('BSK_0002', '2025-01-15', 90.0, 44.1, 52.2);

INSERT INTO chrp_archive (well_name, date_time, c_voltage, c_power, c_freq, c_current, c_speed, c_temp) VALUES
  ('BSK_0001', '2025-01-15 01:59:00', 380.0, 27.2, 50.0, 16.5, 1450.0, 48.5);

INSERT INTO oil_loss (oil_field, well, date, tm_oil, well_work_time, tm_obv, tm_fluid, water_lab) VALUES
  ('BSK', 'BSK_0001', '2025-01-10', 55.3, 24.0, 48.7, 110.2, 47.9),
  ('BSK', 'BSK_0001', '2025-01-11', 54.1, 24.0, 49.1, 108.0, 48.0),
  ('BSK', 'BSK_0002', '2025-01-10', 44.1, 23.5, 52.2, 90.0, 51.7),
  ('BSK', 'BSK_0002', '2025-01-11', 43.5, 24.0, 53.0, 88.5, 52.1);
