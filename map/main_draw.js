import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {Draw, Modify, Snap} from 'ol/interaction.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {get} from 'ol/proj.js';
import {toLonLat, fromLonLat} from 'ol/proj';
import {Style, Fill, Stroke, Circle, Icon} from 'ol/style.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import Overlay from 'ol/Overlay.js';
// import Stroke from 'ol/style/Stroke.js';

let draw, snap; // global so we can remove them later
let toolType = "Cursor"
let brushColor = '#ffcc33';
let brushWidth = 5;
let fillStyle = new Fill({color:'rgba(255, 255, 255, 0.2)'});

//base map
const raster = new TileLayer({
  source: new OSM(),
});

const source = new VectorSource();
const vector = new VectorLayer({
  source: source,
});
const markSource = new VectorSource();
const markLayer = new VectorLayer({
  source: markSource,
});


// Limit multi-world panning to one world east and west of the real world.
// Geometry coordinates have to be within that range.
const extent = get('EPSG:3857').getExtent().slice();
const view =  new View({
  center: fromLonLat([120,24]),
  zoom: 6,
  extent
});
const map = new Map({
  layers: [raster, vector, markLayer],
  target: 'map',
  view:view,
});

//Add popup overlay
const spotToolBox = document.getElementById('spot_tool');

const spotToolBoxPopUp = new Overlay({
  element: spotToolBox,
  positioning: 'bottom-center',
  stopEvent: false,
});
map.addOverlay(spotToolBoxPopUp);

// Draw on map
const modify = new Modify({source: source});
map.addInteraction(modify);

function addInteractions() {
  draw = new Draw({
    source: source,
    type: toolType,
    style:{
      'circle-radius': 2,
      'circle-fill-color': brushColor,
      'stroke-color': brushColor,
      'stroke-width': brushWidth,
      'fill-color': 'rgba(255, 255, 255, 0.2)',
    }
  });
  map.addInteraction(draw);
  snap = new Snap({source: source});
  map.addInteraction(snap);
}

source.on("addfeature",(e)=>{
  e.feature.setStyle(
    new Style({
      fill: fillStyle,
      stroke: new Stroke({
        width: brushWidth,
        color: brushColor
      }),
      image: new Circle({
        fill: new Fill({
          color: brushColor
        }),
        strokeStyle: new Stroke({
          color: [255,0,0],
          width: brushWidth,
        }),
        radius: 7,
      })
    })
  )
})

// let popover;
// function disposePopover() {
//   if (popover) {
//     popover.dispose();
//     popover = undefined;
//   }
// }
const generateUid = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

map.on("click",(e)=>{
  if (toolType === 'Mark'){
    const iconFeature = new Feature({
      geometry: new Point(e.coordinate),
      name: 'Spot-Point',
      location: e.coordinate,
    });
    const iconStyle = new Style({
      image: new Icon({
        anchor: [0.5, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        scale:0.7,
        src: '/icon/010-location-2.png',
      }),
    });
    iconFeature.setId(generateUid());
    iconFeature.setStyle(iconStyle);
    markSource.addFeature(iconFeature);
    vector.setSource(source);
  }else if(toolType === 'Cursor'){
    const feature = map.forEachFeatureAtPixel(e.pixel, function (feature) {
      //Check if point
      if(feature.get("name") == "Spot-Point"){
        let featureId = feature.getId();
        document.getElementById("spot_delete").onclick = function(){
          deleteSpot(featureId)
        }
        document.getElementById("spot_edit").onclick = function(){
          addSpotInfo()
        }
        let location = feature.get("location")
        setSpotLocation(location)
        spotToolBoxPopUp.setPosition(location)
        spotToolBoxPopUp.setPositioning('bottom-center')
      }
      //get lat and long
      return feature;
    });
    if (!feature) {
      spotToolBoxPopUp.setPosition(undefined)
      return;
    }
  }
})
const getAddressbyCoordination = async (coordinate) => {
  try{
    let coords = toLonLat(coordinate)
    let response = await fetch('http://nominatim.openstreetmap.org/reverse?format=json&lon=' + coords[0] + '&lat=' + coords[1]);
    let data = await response.json();
    console.log(data);
    return data["address"]
  }catch{
    return {"error":true}
  }
}


const setSpotLocation = async (location) => {
  let address = await getAddressbyCoordination(location)
  document.getElementById("country_text").innerText = address["country"];
  document.getElementById("city_text").innerText = address["city"] || address["county"] || address["district"];
}

const addSpotInfo = () => {
  document.getElementById("spot_info_popup").style.display = "flex";
  //set Country and City
  
}

const deleteSpot = (featureId) => {
  let featureObject = markSource.getFeatureById(featureId)
  markSource.removeFeature(featureObject)
}

const closePopup = () => {
  document.getElementById("spot_info_popup").style.display = "none"
}

// change mouse cursor when over marker
// map.on('pointermove', function (e) {
//   const pixel = map.getEventPixel(e.originalEvent);
//   const hit = map.hasFeatureAtPixel(pixel);
//   if(hit){
//     this.getTargetElement().style.cursor = "pointer"
//   }else{
//     this.getTargetElement().style.cursor = '';
//   }
// });

const setBrushWidth = (widthInput) => {
    brushWidth = widthInput.value
    map.removeInteraction(draw);
    map.removeInteraction(snap);
    addInteractions(); 
}
const setBrushColor = (colorInput) => {
    brushColor = colorInput.value
    map.removeInteraction(draw);
    map.removeInteraction(snap);
    addInteractions(); 
}

const setTool = (element) =>{
    if(toolType === element.value){
      markToggle(false)
      toolType = "Cursor"
    }else{
      toolType = element.value;
      map.removeInteraction(draw);
      map.removeInteraction(snap);
    }
    
    if (element.value == "LineString" || element.value == "Polygon" || element.value == "Circle"){ 
      addInteractions();  
    }else if (toolType == "Mark"){
      markToggle(true)
    }
}
const markToggle = (open) => {
  const mark = document.getElementById("set_mark")
  mark.style.transform = open? "scale(1.2) translateY(-10px)":"none";
}



///////////////////////////////////////////////////////////////////
window.setTool = setTool;
window.setBrushWidth = setBrushWidth;
window.setBrushColor = setBrushColor;
window.addSpotInfo = addSpotInfo;
window.deleteSpot = deleteSpot;
window.closePopup = closePopup;
///////////////////////////////////////////////////////////////////
// const markPoint = document.getElementById("mark_point")
// const markRoute = document.getElementById("mark_route")
// const drawLine = document.getElementById("draw_line")
// const drawPolygon = document.getElementById("draw_polygon")
// const drawCircle = document.getElementById("draw_circle")
// const drawByPen = document.getElementById("draw_by_pen")
// const drawByBrush = document.getElementById("draw_by_brush")
///////////////////////////////////////////////////////////////////
// import Feature from 'ol/Feature.js';
// import Polygon from 'ol/geom/Polygon.js';
// import Point from 'ol/geom/Point.js';
// import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';

// const feature = new Feature({
//   geometry: new Polygon([[
//     fromLonLat([-16,-22]),
//     fromLonLat([-44,-55]),
//     fromLonLat([-88,75])
// ]]),
//   labelPoint: new Point([[fromLonLat([120,23.5])]]),
//   name: 'My Polygon',
// });
// const testStyle = new Style({
//     stroke: new Stroke({
//         color: 'blue',
//         width: 20,
//     }),
//     fill: new Fill({
//         color:'rgba(0, 0, 255, 1)',
//     }),
// }) 
// feature.setStyle(testStyle)
// console.log(feature)

// // get the polygon geometry
// const poly = feature.getGeometry();

// // Render the feature as a point using the coordinates from labelPoint
// feature.setGeometryName('labelPoint');
// source.addFeature(feature)
// console.log(source)
// vector.setSource(source)

// // get the point geometry
// const point = feature.getGeometry();