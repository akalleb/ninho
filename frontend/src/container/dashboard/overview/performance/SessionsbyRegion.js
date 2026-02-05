'use client';
import React, { useState, useEffect } from 'react';
import { Row, Col, Table } from 'antd';
import FeatherIcon from 'feather-icons-react';
import { Scrollbars } from 'react-custom-scrollbars';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { RegionList, RegionMap } from '../../style';
import { Cards } from '../../../../components/cards/frame/cards-frame';
import { regionFilterData, regionGetData } from '../../../../redux/chartContent/actionCreator';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"


const moreContent = (
  <>
    <a href="#">
      <FeatherIcon size={16} icon="printer" />
      <span>Printer</span>
    </a>
    <a href="#">
      <FeatherIcon size={16} icon="book-open" />
      <span>PDF</span>
    </a>
    <a href="#">
      <FeatherIcon size={16} icon="file-text" />
      <span>Google Sheets</span>
    </a>
    <a href="#">
      <FeatherIcon size={16} icon="x" />
      <span>Excel (XLSX)</span>
    </a>
    <a href="#">
      <FeatherIcon size={16} icon="file" />
      <span>CSV</span>
    </a>
  </>
);

const regionColumns = [
  {
    title: 'Top Region',
    dataIndex: 'region',
    key: 'region',
  },
  {
    title: 'Sessions',
    dataIndex: 'sessions',
    key: 'sessions',
  },
];

function SessionsbyRegion() {
  const dispatch = useDispatch();
  const { regionState } = useSelector(state => {
    return {
      regionState: state.chartContent.regionData,
      lpIsLoading: state.chartContent.lpLoading,
    };
  });

  const [state, setState] = useState({
    region: 'year',
  });

  useEffect(() => {
    if (regionGetData) {
      dispatch(regionGetData());
    }
  }, [dispatch]);

  const regionData = [];

  if (regionState !== null)
    regionState.map((item, key) => {
      return regionData.push({
        key: key + 1,
        region: item[0],
        sessions: item[1],
      });
    });

  const handleActiveChangeRegion = value => {
    setState({
      ...state,
      region: value,
    });
    dispatch(regionFilterData(value));
  };

  function renderThumb({ style, ...props }) {
    const thumbStyle = {
      borderRadius: 6,
      backgroundColor: '#F1F2F6',
      height: '220px',
    };
    return <div style={{ ...style, ...thumbStyle }} {...props} />;
  }

  renderThumb.propTypes = {
    style: PropTypes.shape(PropTypes.object).isRequired,
  };

  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
  const [content, setContent] = useState('');
  
  function handleZoomIn() {
    if (position.zoom >= 4) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom * 2 }));
  }

  function handleZoomOut() {
    if (position.zoom <= 1) return;
    setPosition(pos => ({ ...pos, zoom: pos.zoom / 2 }));
  }

  function handleMoveEnd(pos) {
    setPosition(pos);
  }

  return (
    <Cards
      isbutton={
        <div className="card-nav">
          <ul>
            <li className={state.region === 'week' ? 'active' : 'deactivate'}>
              <span onClick={() => handleActiveChangeRegion('week')} className="cursor-pointer">
                Week
              </span>
            </li>
            <li className={state.region === 'month' ? 'active' : 'deactivate'}>
              <span onClick={() => handleActiveChangeRegion('month')} className="cursor-pointer">
                Month
              </span>
            </li>
            <li className={state.region === 'year' ? 'active' : 'deactivate'}>
              <span onClick={() => handleActiveChangeRegion('year')} className="cursor-pointer">
                Year
              </span>
            </li>
          </ul>
        </div>
      }
      title="Sessions by Region"
      size="large"
      more={moreContent}
    >
      <Row>
        <Col xxl={10} md={11} xs={24}>
          <RegionList>
            <Scrollbars autoHeight autoHeightMin={280} autoHide renderThumbVertical={renderThumb}>
              <Table columns={regionColumns} dataSource={regionData} pagination={false} />
            </Scrollbars>
          </RegionList>
        </Col>
        <Col xxl={14} md={13} xs={24}>
          <RegionMap>
            <div>
              <ReactTooltip>{content}</ReactTooltip>
              <ComposableMap
                data-tip=""
                data-html
                projectionConfig={{
                  scale: window.innerWidth <= 440 ? 160 : 150,
                }}
                viewBox="110, 50, 800, 410"
              >
                <ZoomableGroup zoom={position.zoom} center={position.coordinates} onMoveEnd={handleMoveEnd}>
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map(geo => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={() => {
                            const { name } = geo.properties;
                            setContent(`${name}`);
                          }}
                          onMouseLeave={() => {
                            setContent('');
                          }}
                          fill="#DBE1E8"
                          stroke="#FFF"
                          strokeWidth={0.5}
                          style={{
                            default: {
                              fill: '#DBE1E8',
                              outline: 'none',
                            },
                            hover: {
                              fill: '#5F63F2',
                              outline: 'none',
                            },
                            pressed: {
                              fill: '#5F63F2',
                              outline: 'none',
                            },
                          }}
                        />
                      ))
                    }
                  </Geographies>
                </ZoomableGroup>
              </ComposableMap>

              <div className="controls">
                <button type="button" onClick={handleZoomIn}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <button type="button" onClick={handleZoomOut}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            </div>
          </RegionMap>
        </Col>
      </Row>
    </Cards>
  );
}

export default SessionsbyRegion;
