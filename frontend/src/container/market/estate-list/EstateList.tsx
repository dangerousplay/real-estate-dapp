import React, {useState} from "react";
import {Button, Card, Col, Form, Row} from "react-bootstrap";
import {useQuery} from "urql";
import {useHistory} from "react-router-dom";
import {PAGES} from "../../../pages";
import {CountryDropdown, RegionDropdown} from "react-country-region-selector";
import "./EstateList.css"
import {urqlClient} from "../../../graphq";
import AsyncSelect from "react-select/async";
import {useSelector} from "react-redux";
import {RootState} from "../../../store";
import {calculateOutdatedTime} from "../../../utils/RealEstate";
const {fromWei} = require("web3-utils");


const RealEstateQuery = (filters: any) => `
  query {
    realEstates(where: ${JSONtoString(filters)}) {
      id
      photos
      price
      place {
        street
        number
        city
        neighbour
        region
      }
    }
  }
`;

const PlacesQuery = (filters: any) => `
  query {
    estatePlaces(where: ${JSONtoString(filters)}) {
      id
    }
  }
`;

const StreetsQuery = `
  query streets($street: String) {
    estatePlaces(first: 10, where: { street_contains: $street}) {
      label: street
      value: street
    }
  }
`;

const CitiesQuery = `
  query cities($city: String) {
    estatePlaces(first: 10, where: { city_contains: $city}) {
      label: city
      value: city
    }
  }
`;

const NeighbourQuery = `
  query cities($neighbour: String) {
    estatePlaces(first: 10, where: { neighbour_contains: $neighbour}) {
      label: neighbour
      value: neighbour
    }
  }
`


/**
 * Transform the given object into a string representation without quote in the properties.
 */
const JSONtoString = (json: any) => {
    const cleaned = JSON.stringify(json, null, 2);

    return cleaned.replace(/^[\t ]*"[^:\n\r]+(?<!\\)":/gm, function (match) {
        return match.replace(/"/g, "");
    });
}

function FilterRealEstate(props: { onFilterChange: (filters: any) => void }) {
    const [filters, setFilters] = useState({})

    const user = useSelector((root: RootState) => root.user);

    const [placeQueryFilters, setPlaceQueryFilters] = useState({})
    const [country, setCountry] = useState("Brazil");
    const [region, setRegion] = useState("Rio Grande do Sul");

    const setFiltersNotifying = (f: any) => {
        props.onFilterChange(f)
        setFilters(f)
    }

    const setEstateFilter = (filterName: string ) => {
        const newFilter = {...filters};
        return (event: any) => {
            let value = event?.target?.value;
            if(!value) value = event

            // @ts-ignore
            newFilter[filterName] = value
            setFiltersNotifying(newFilter);
        }
    }

    const setPlaceFilters = (filterName: string, value: string) => {
        const newPlaceQueryFilters = {...placeQueryFilters};
        // @ts-ignore
        newPlaceQueryFilters[filterName] = value;

        setPlaceQueryFilters(newPlaceQueryFilters);

        return newPlaceQueryFilters;
    }

    const searchCities = async (city: string) => {
        const places = await urqlClient
            .query(CitiesQuery, { city })
            .toPromise();

        return places.data?.estatePlaces
    };

    const searchStreets = async (street: string) => {
        const places = await urqlClient
            .query(StreetsQuery, { street })
            .toPromise();

        return places.data?.estatePlaces
    };

    const searchNeighbours = async (neighbour: string) => {
        const places = await urqlClient
            .query(NeighbourQuery, { neighbour })
            .toPromise();

        return places.data?.estatePlaces
    };

    const searchPlaces = async (filters: any) => {
        const places = await urqlClient
            .query(PlacesQuery(filters))
            .toPromise();

        return places.data?.estatePlaces?.map((i: any) => i.id)
    }

    function setEstatePlaceFilter(filterName: string, value: string) {
        searchPlaces(setPlaceFilters(filterName, value))
            .then(ids => setEstateFilter("place_in")(ids))
    }

    return <Card>
        <Card.Header>
            Filtros
        </Card.Header>
        <Card.Body>
            <Card.Header>
                Negociação
            </Card.Header>
            <Card.Body>
            <div>
                <input type="checkbox" value={1} onChange={e => {
                    setEstateFilter("isAcceptingEstate")(e.target.value == "1")
                }}/>
                Aceita outro imóvel
            </div>
                <br/>
            <div>
                <p>Valor minimo do imóvel</p>
                <input type="number" min={0} onChange={setEstateFilter("price_gte")}/>
            </div>
                <br/>
            <div>
                <p> Valor máximo do imóvel </p>
                <input type="number" min={0} onChange={setEstateFilter("price_lte")}/>
            </div>
                { user.isAdmin &&
                    <div>
                        <input type="checkbox" value={1} onChange={e => {
                            const outdatedDate = calculateOutdatedTime()

                            if(e.target.value == "1") setEstateFilter("lastModified_lte")(outdatedDate)
                        }}/>
                        Imóveis desatualizados
                    </div>
                }

            </Card.Body>

            <Card.Header>
                Onde
            </Card.Header>
            <Card.Body>
                <p>País:</p>
                <div>
                    <CountryDropdown
                        value={country}
                        onChange={e => {
                            setCountry(e);
                            setEstatePlaceFilter("country", e);
                        }} name="country"/>
                </div>
                <br/>

                <p>Estado:</p>
                <div>
                    <RegionDropdown
                        country={country}
                        value={region}
                        onChange={e => {
                            setRegion(e);
                            setEstatePlaceFilter("region", e);
                        }} name="region"/>
                </div>
                <br/>
                <p>Cidade:</p>
                <div>
                    <AsyncSelect loadOptions={searchCities} onChange={(e,_) => {
                        if(e) setEstatePlaceFilter("city", e as string);
                    }}/>
                </div>

                <br/>
                <p>Bairro:</p>
                <div>
                    <AsyncSelect loadOptions={searchNeighbours} onChange={(e,_) => {
                        if(e) setEstatePlaceFilter("neighbour", e as string);
                    }}/>
                </div>

                <br/>
                <p>Rua:</p>
                <div>
                    <AsyncSelect loadOptions={searchStreets} onChange={(e,_) => {
                        if(e) setEstatePlaceFilter("street", e as string);
                    }}/>
                </div>
                <br/>
            </Card.Body>

        </Card.Body>
    </Card>;
}

function EstateView(data: any, history: any) {
    return data?.realEstates.map((e: any) => {
        return <Col key={e.id}>
            <Card>
                <Card.Img variant="top" src={e.photos[0]}/>
                <Card.Body>
                    <Card.Title>Dados do imóvel</Card.Title>
                    <Card.Text>
                        Estado: {e.place.region} <br/>
                        Cidade: {e.place.city} <br/>
                        Bairro: {e.place.neighbour} <br/>
                        Rua: {e.place.street} <br/>
                        Número: {e.place.number}
                        <br/>
                        <strong>Valor em Ether: {fromWei(e.price, 'ether')}</strong>
                    </Card.Text>

                    <Button onClick={_ => history.push(PAGES.estate.view + "/" + e.id)}>
                        Visualizar imóvel
                    </Button>
                </Card.Body>
            </Card>
        </Col>
    });
}

export const EstateList: React.FC = () => {
    const [queryFilter, setQueryFilter] = useState({ isTrading: true })

    const [result, reexecuteQuery] = useQuery({
        query: RealEstateQuery(queryFilter)
    });

    const history = useHistory()

    const {data, fetching, error} = result;

    return (
        <>
            <Row xs={1} md={4} className="g-4">
                <Col>
                    <FilterRealEstate onFilterChange={setQueryFilter}/>
                </Col>
                {fetching ? <p>Loading...</p> : EstateView(data, history)}
                {error ? <p>Oh no... {error.message}</p> : <div/> }
            </Row>
        </>
    )
};