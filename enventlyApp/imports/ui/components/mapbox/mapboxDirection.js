export const mapboxDirectionStyle = [{
    'id': 'directions-route-line-alt',
    'type': 'line',
    'source': 'directions',
    'layout': {
        'line-cap': 'round',
        'line-join': 'round'
    },
    'paint': {
        'line-color': '#bbb',
        'line-width': 4
    },
    'filter': [
        'all', ['in', '$type', 'LineString'],
        ['in', 'route', 'alternate']
    ]
}, {
    'id': 'directions-route-line',
    'type': 'line',
    'source': 'directions',
    'layout': {
        'line-cap': 'round',
        'line-join': 'round'
    },
    'paint': {
        'line-color': '#3bb2d0',
        'line-width': 4
    },
    'filter': [
        'all', ['in', '$type', 'LineString'],
        ['in', 'route', 'selected']
    ]
}, {
    'id': 'directions-hover-point-casing',
    'type': 'circle',
    'source': 'directions',
    'paint': {
        'circle-radius': 8,
        'circle-color': '#fff'
    },
    'filter': [
        'all', ['in', '$type', 'Point'],
        ['in', 'id', 'hover']
    ]
}, {
    'id': 'directions-hover-point',
    'type': 'circle',
    'source': 'directions',
    'paint': {
        'circle-radius': 6,
        'circle-color': '#3bb2d0'
    },
    'filter': [
        'all', ['in', '$type', 'Point'],
        ['in', 'id', 'hover']
    ]
}, {
    'id': 'directions-waypoint-point-casing',
    'type': 'circle',
    'source': 'directions',
    'paint': {
        'circle-radius': 8,
        'circle-color': '#fff'
    },
    'filter': [
        'all', ['in', '$type', 'Point'],
        ['in', 'id', 'waypoint']
    ]
}, {
    'id': 'directions-waypoint-point',
    'type': 'circle',
    'source': 'directions',
    'paint': {
        'circle-radius': 6,
        'circle-color': '#8a8bc9'
    },
    'filter': [
        'all', ['in', '$type', 'Point'],
        ['in', 'id', 'waypoint']
    ]
}, {
    'id': 'directions-origin-point',
    'type': 'circle',
    'source': 'directions',
    'paint': {
        'circle-radius': 8,
        'circle-color': '#fff',
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ff0000'
    },
    'filter': [
        'all', ['in', '$type', 'Point'],
        ['in', 'marker-symbol', 'A']
    ]
}, {
    'id': 'directions-origin-label',
    'type': 'symbol',
    'source': 'directions',
    'layout': {
        /*'text-field': 'A',
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 12*/
    },
    'paint': {
        'text-color': '#fff'
    },
    'filter': [
        'all', ['in', '$type', 'Point'],
        ['in', 'marker-symbol', 'A']
    ]
}, {
    'id': 'directions-destination-point',
    'type': 'circle',
    'source': 'directions',
    'paint': {
        'circle-radius': 8,
        'circle-color': '#fff',
        'circle-stroke-width': 3,
        'circle-stroke-color': '#01A2EA'
    },
    'filter': [
        'all', ['in', '$type', 'Point'],
        ['in', 'marker-symbol', 'B']
    ]
}, {
    'id': 'directions-destination-label',
    'type': 'symbol',
    'source': 'directions',
    'layout': {
        /*'text-field': 'B',
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 12*/
    },
    'paint': {
        'text-color': '#fff'
    },
    'filter': [
        'all', ['in', '$type', 'Point'],
        ['in', 'marker-symbol', 'B']
    ]
}]
