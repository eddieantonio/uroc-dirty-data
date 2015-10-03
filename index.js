const SparqlClient = require('sparql-client-2');
const SPARQL = SparqlClient.SPARQL;

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

function fetchDuplicates(name) {
  const query = SPARQL`
    PREFIX nyt: <http://data.nytimes.com/>
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    PREFIX geop: <http://www.geonames.org/ontology#>

    SELECT ?LocationA ?nameA ?LocationB ?nameB
    FROM <http://data.nytimes.com>
    WHERE {
      ?LocationA geo:lat ?lat ;
                 geo:long ?long ;
                 geop:name ?nameA .
      ?LocationB geo:lat ?lat ;
                 geo:long ?long ;
                 geop:name ?nameB .

      FILTER(?LocationA != ?LocationB)
    }`;

  return client
    .query(query)
    .execute()
    // Get the item we want.
    .then(response => {
      console.dir(response, {depth: null});
    });
}

console.log('Finding potential duplicates...');
fetchDuplicates();
