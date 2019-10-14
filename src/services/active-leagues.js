// Vendor
const requestPromise = require('request-promise');

// Constants
const LEAGUE_API_URL = 'https://api.pathofexile.com/leagues';
const FALLBACK_LEAGUE = 'Standard';

exports.fetchActiveLeagues = async () => {
  const rawResponse = await requestPromise({
    uri: LEAGUE_API_URL
  });

  const leagues = JSON.parse(rawResponse);

  return leagues.map(({id}) => id);
};

exports.fetchCurrentLeague = async (leagueSetting) => {
  const validLeagues = await this.fetchActiveLeagues();

  return validLeagues.includes(leagueSetting) ? leagueSetting : FALLBACK_LEAGUE;
};
