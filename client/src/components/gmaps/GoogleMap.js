import React, { Fragment, useState} from 'react';
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';
import Geocode from "react-geocode";

const GoogleMap = ({location, google}) => {
    const [mapData, setMapData] = useState({
        latitude: '',
        longitude: '',
    });
    console.log(location);

    const mapStyles = {
        width: '100%',
        height: '100%',
    };

    const { latitude, longitude } = mapData;
    const mapsData = (lat, lng) => setMapData({ latitude: lat, longitude: lng});

    Geocode.setApiKey('AIzaSyDyQCz68b0tkMcwF1-KyTv8nQyGftNjPHs');
    Geocode.setLanguage("en");
    Geocode.fromAddress(location).then(
        response => {
            const { lat, lng } = response.results[0].geometry.location;
            mapsData(lat, lng);

        },
        error => {
            console.error(error);
        }
    );


    return <Fragment>
        <div >
            <Map
                google={google}
                zoom={8}
                style={mapStyles}
                center={{ lat: latitude , lng: longitude }}
            >
                <Marker position={{ lat: latitude , lng: longitude }} />
            </Map>
        </div>
    </Fragment>;
};

export default GoogleApiWrapper({
    apiKey: 'AIzaSyDyQCz68b0tkMcwF1-KyTv8nQyGftNjPHs'
}) (GoogleMap);