import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import View from 'ol/View.js';
import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer.js';
import {fromLonLat} from 'ol/proj';

import Static from 'ol/source/ImageStatic.js';

const imageExtent = [120-10, 30-3, 120+10, 30+3];
const imageLayer = new ImageLayer();

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    imageLayer,
  ],
  target: 'map',
  view: new View({
    center: fromLonLat([120,24]),
    zoom: 0,
  }),
});

function setSource() {
  const source = new Static({
    url:
      'https://images.unsplash.com/photo-1682687218904-de46ed992b58?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2143&q=80',
    crossOrigin: '',
    projection: 'EPSG:4326',
    imageExtent: imageExtent,
    interpolate: true,
  });
  imageLayer.setSource(source);
}
setSource();
