const assert = require('assert');

const SparqlClient = require('sparql-client-2');
const SPARQL = SparqlClient.SPARQL;

// Degrees, long/lat -- note: this is entirely arbirtray.
const WINDOW_SIZE = 0.1;

const client =
  new SparqlClient('http://husky-big.cs.uwaterloo.ca:8890/sparql')
    // Register ALL of the needed prefixes.
    .register({
      db: 'http://dbpedia.org/resource/',
      dbpedia: 'http://dbpedia.org/property/',
      ny: 'http://data.nytimes.com/',
      owl: 'http://www.w3.org/2002/07/owl#',
      geo: 'http://www.w3.org/2003/01/geo/wgs84_pos#',
      geop: 'http://www.geonames.org/ontology#'
    });

function longestString(val1, val2) {
  return (val1.length > val2.length) ? val1 : val2;
}
function replaceItude(itude) {
  return function () {
    const query = `
      SELECT ?LocationA ?LongitudeA datatype(?LongitudeA) AS ?TypeA
             ?LocationB ?LongitudeB datatype(?LongitudeB) AS ?TypeB
      FROM <http://data.nytimes.com>
      WHERE {
        ?LocationA owl:sameAs ?LocationB .

        ?LocationA geo:${itude}    ?LongitudeA .
        ?LocationB geo:${itude} ?LongitudeB .
        FILTER(?LongitudeA != ?LongitudeB)
      }
    `;

    return client
      .query(query)
      .execute()
      // Get the item we want.
      .then(response => {
        const locations = response.results.bindings;

        locations.forEach(location => {
          const measurement = longestString(location.LongitudeA.value,
                                            location.LongitudeB.value);
          const id = location.LocationA;
          console.log(SPARQL`${id} ${{geo: itude}} ${measurement} .`);
        });

      })
      .catch(error => {
        console.dir(error);
        throw error;
      });
  };
}

const replaceLatitude = replaceItude('lat');
const replaceLongitude = replaceItude('long');
replaceLatitude();
replaceLongitude();
