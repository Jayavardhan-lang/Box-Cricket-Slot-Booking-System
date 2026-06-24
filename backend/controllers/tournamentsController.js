const pool = require('../config/db');

const getAllTournaments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*,
        (SELECT COUNT(*) FROM tournament_registrations WHERE tournament_id = t.id) AS registrations_count,
        (t.max_teams - (SELECT COUNT(*) FROM tournament_registrations WHERE tournament_id = t.id)) AS spots_remaining
       FROM tournaments t
       ORDER BY t.date`
    );

    const rows = result.rows.map(row => ({
      ...row,
      registrations_count: parseInt(row.registrations_count || 0, 10),
      spots_remaining: parseInt(row.spots_remaining || 0, 10),
    }));

    res.json({ success: true, data: rows, message: 'Tournaments fetched successfully' });
  } catch (error) {
    console.error('getAllTournaments error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTournament = async (req, res) => {
  try {
    const { name, date, entry_fee = 0, max_teams = 8, status = 'upcoming' } = req.body;

    if (!name || !date) {
      return res.status(400).json({
        success: false,
        message: 'name and date are required',
      });
    }

    const result = await pool.query(
      'INSERT INTO tournaments (name, date, entry_fee, max_teams, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, date, entry_fee, max_teams, status]
    );

    res.status(201).json({
      success: true,
      data: { id: result.rows[0].id },
      message: 'Tournament created successfully',
    });
  } catch (error) {
    console.error('createTournament error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTournament = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, entry_fee, max_teams, status } = req.body;

    const existing = await pool.query('SELECT * FROM tournaments WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    const fields = [];
    const values = [];
    let idx = 1;
    if (name       !== undefined) { fields.push(`name = $${idx++}`);       values.push(name); }
    if (date       !== undefined) { fields.push(`date = $${idx++}`);       values.push(date); }
    if (entry_fee  !== undefined) { fields.push(`entry_fee = $${idx++}`);  values.push(entry_fee); }
    if (max_teams  !== undefined) { fields.push(`max_teams = $${idx++}`);  values.push(max_teams); }
    if (status     !== undefined) { fields.push(`status = $${idx++}`);     values.push(status); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(id);
    await pool.query(`UPDATE tournaments SET ${fields.join(', ')} WHERE id = $${idx}`, values);

    res.json({ success: true, data: { id }, message: 'Tournament updated successfully' });
  } catch (error) {
    console.error('updateTournament error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const registerTeam = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id: tournament_id } = req.params;
    const { team_name, captain_name, phone, payment_status = 'pending' } = req.body;

    if (!team_name || !captain_name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'team_name, captain_name, and phone are required',
      });
    }

    const tournamentResult = await client.query(
      `SELECT t.*,
        (SELECT COUNT(*) FROM tournament_registrations WHERE tournament_id = t.id) AS registrations_count
       FROM tournaments t WHERE t.id = $1`,
      [tournament_id]
    );

    if (tournamentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    const t = tournamentResult.rows[0];
    const registrationsCount = parseInt(t.registrations_count || 0, 10);
    if (registrationsCount >= t.max_teams) {
      return res.status(409).json({
        success: false,
        message: 'Tournament is full — no spots remaining',
      });
    }

    await client.query('BEGIN');

    const regResult = await client.query(
      `INSERT INTO tournament_registrations 
       (tournament_id, team_name, captain_name, phone, payment_status)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [tournament_id, team_name, captain_name, phone, payment_status]
    );

    await client.query(
      `INSERT INTO points_table (tournament_id, team_name, played, won, lost, points)
       VALUES ($1, $2, 0, 0, 0, 0)`,
      [tournament_id, team_name]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: { registrationId: regResult.rows[0].id },
      message: 'Team registered successfully',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('registerTeam error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

const getRegistrations = async (req, res) => {
  try {
    const { id: tournament_id } = req.params;
    const result = await pool.query(
      'SELECT * FROM tournament_registrations WHERE tournament_id = $1 ORDER BY registered_at',
      [tournament_id]
    );
    res.json({ success: true, data: result.rows, message: 'Registrations fetched successfully' });
  } catch (error) {
    console.error('getRegistrations error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFixtures = async (req, res) => {
  try {
    const { id: tournament_id } = req.params;
    const result = await pool.query(
      'SELECT * FROM fixtures WHERE tournament_id = $1 ORDER BY match_date, match_time',
      [tournament_id]
    );
    res.json({ success: true, data: result.rows, message: 'Fixtures fetched successfully' });
  } catch (error) {
    console.error('getFixtures error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const createFixture = async (req, res) => {
  try {
    const { tournament_id, team1, team2, match_date, match_time } = req.body;

    if (!tournament_id || !team1 || !team2) {
      return res.status(400).json({
        success: false,
        message: 'tournament_id, team1, and team2 are required',
      });
    }

    const result = await pool.query(
      'INSERT INTO fixtures (tournament_id, team1, team2, match_date, match_time) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [tournament_id, team1, team2, match_date || null, match_time || null]
    );

    res.status(201).json({
      success: true,
      data: { id: result.rows[0].id },
      message: 'Fixture created successfully',
    });
  } catch (error) {
    console.error('createFixture error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateFixture = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { result, match_date, match_time, status } = req.body;

    const existing = await client.query('SELECT * FROM fixtures WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      client.release();
      return res.status(404).json({ success: false, message: 'Fixture not found' });
    }

    const fixture = existing.rows[0];

    await client.query('BEGIN');

    const fields = [];
    const vals = [];
    let idx = 1;
    if (result     !== undefined) { fields.push(`result = $${idx++}`);     vals.push(result); }
    if (match_date !== undefined) { fields.push(`match_date = $${idx++}`); vals.push(match_date); }
    if (match_time !== undefined) { fields.push(`match_time = $${idx++}`); vals.push(match_time); }
    if (status     !== undefined) { fields.push(`status = $${idx++}`);     vals.push(status); }

    if (result) {
      fields.push("status = 'completed'");
    }

    if (fields.length > 0) {
      vals.push(id);
      await client.query(`UPDATE fixtures SET ${fields.join(', ')} WHERE id = $${idx}`, vals);
    }

    if (result) {
      const winner = result.trim();
      const loser = winner === fixture.team1 ? fixture.team2 : fixture.team1;

      await client.query(
        `UPDATE points_table 
         SET played = played + 1, won = won + 1, points = points + 2
         WHERE tournament_id = $1 AND team_name = $2`,
        [fixture.tournament_id, winner]
      );

      await client.query(
        `UPDATE points_table 
         SET played = played + 1, lost = lost + 1
         WHERE tournament_id = $1 AND team_name = $2`,
         [fixture.tournament_id, loser]
      );
    }

    await client.query('COMMIT');

    res.json({ success: true, data: { id }, message: 'Fixture updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('updateFixture error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};

const getPointsTable = async (req, res) => {
  try {
    const { id: tournament_id } = req.params;
    const result = await pool.query(
      'SELECT * FROM points_table WHERE tournament_id = $1 ORDER BY points DESC, won DESC',
      [tournament_id]
    );
    res.json({ success: true, data: result.rows, message: 'Points table fetched successfully' });
  } catch (error) {
    console.error('getPointsTable error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllTournaments,
  createTournament,
  updateTournament,
  registerTeam,
  getRegistrations,
  getFixtures,
  createFixture,
  updateFixture,
  getPointsTable,
};
