import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './index.less';
import t from 'locale';
import lodash from 'lodash';
import {
  ORDER_COLORS,
  POOL_STATUS,
  xAxisConfig,
  CHART_TOOLTIP_BACKGROUND_COLOR,
  CHART_TOOLTIP_LINE_COLOR,
  CHART_FORECAST_COLOR,
  lineSeriesConfig,
} from 'constants';
import echarts from 'echarts/lib/echarts';
import { EchartsContainer, PercentBar, Table } from 'pure';
import { Select, Icon, Collapse, InputNumber, Tooltip } from 'antd';
import { getPools, getForecastData, getRealtimeForecastData } from 'request';
import {
  nameForecastColumn,
  roleColumn,
  getStatusColumn,
  deviceTypeColumn,
  clusterUsageRate,
  poolUsageRate,
  totalCapacityColumn,
  usedCapacityColumn,
  usedForcastColumn,
} from '../columns';
import moment from 'moment';
import { convertBytes, hexToRgba } from 'utils';
export default class CapacityAnalysis extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chartIdentity: 'forcastChartIdentity' + Date.now(), //图标ID
      isPoolDropdown: true, //存储池默认禁止下拉
      isShowAllCluster: true, //是否显示所有集群
      isShowAllPool: true, //是否显示所有存储池
      haveForecast:false, //整个集群是否有预测值
      clusters: [], //集群列表
      pools: [], //存储池列表
      listData: [], //选择筛选的数据列表
      poolsData: [], //存储池预测值
      chartData: [],
      collapsePanleOpen: [],
      cluserId: null,
      cluserName: t('所有集群'),
      poolName: t('所有存储池'),
      selPoolExpan: t('请选择存储池'),
      poolRemainDays: '--',
      poolAddDB: '--',
    };
    this.tooltip = {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        animation: false,
        label: {
          backgroundColor: '#505765',
        },
      },
    };
    this.grid = {
      left: '10%',
      right: '3%',
      top: '10%',
      bottom: '15%',
    };
  }

  componentDidMount() {
    const { clusters } = this.props;
    let ids = [];
    for (let i = 0, l = clusters.length; i < l; i++) {
      ids.push(clusters[i].id);
    }
    this.getForecastDatas('cluster', ids, true);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.clusters.length !== this.props.clusters.length && this.state.isShowAllCluster) {
      const { clusters } = this.props;
      let ids = [];
      for (let i = 0, l = clusters.length; i < l; i++) {
        ids.push(clusters[i].id);
      }
      this.getForecastDatas('cluster', ids ,true);
    }
  }

  async getPools(id) {
    const where = { cluster_id: id };
    const response = await getPools({ where: where });
    if (response.status === 200) {
      return response.data.rows;
    }
  }

  async getForecast(type, ids) {
    const where = { type: type, ids: JSON.stringify(ids) };
    const response = await getForecastData(where);
    if (response.status === 200) {
      const forcastData = response.data;
      return forcastData;
    }
  }

  async getForcastToExpan(type, id, period, freq) {
    const where = { type: type, id: id, period: period, freq: freq };
    const response = await getRealtimeForecastData(where);
    if (response.status === 200) {
      const forcastData = response.data;
      return forcastData;
    }
  }

  /**
   *  @param 存储池的话直接返回存储池的预测值，集群的话返回集群的值，并且取集群里存储池的最小值
   *
   */
  async getForecastDatas(type, data, isInit) {
    let { clusters } = this.props;
    //获取集群预测值
    let clusterForcast = await this.getForecast('cluster', data);
    if (!clusterForcast) return;
    //获取所有的存储池
    let pools = [];
    for (let i = 0, l = data.length; i < l; i++) {
      let getClusterPools = await this.getPools(data[i]);
      for (let j = 0, k = getClusterPools.length; j < k; j++) {
        pools.push(getClusterPools[j]);
      }
    }
    const poolIds = pools.map(pool => pool.id);
    //获取存储池预测值
    let poolsForecastData = await this.getForecast('pool', poolIds);
    for (let i = 0, l = pools.length; i < l; i++) {
      pools[i].forecast = poolsForecastData[pools[i].id];
    }
    //按存储池算每个集群的最小值
    Object.keys(clusterForcast).map(key => {
      //初次进入时候就该判断整个集群是否有预测
      if (clusterForcast[key].forecast && isInit)  {
        this.setState({haveForecast:true});
      }

      let clusterPools = [];
      for (let i = 0, l = pools.length; i < l; i++) {
        if (pools[i].cluster_id === parseInt(key)) {
          clusterPools.push(pools[i].forecast);
        }
      }
      let avaDaysArray = [];
      if (clusterPools.length === 0) return (clusterForcast[key].forecast = null);
      for (let j = 0, jl = clusterPools.length; j < jl; j++) {
        if (lodash.isEmpty(clusterPools[j])) return (clusterForcast[key].forecast = null);
        avaDaysArray.push(clusterPools[j].availableDays);
      }
      const maxAvaDay = lodash.max(avaDaysArray);
      clusterForcast[key].availableDays = maxAvaDay;
    });
    this.setState({ poolsData: pools });

    if (data.length > 1) {
      //多集群
      for (let i = 0, il = clusters.length; i < il; i++) {
        Object.keys(clusterForcast).map(key => {
          if (parseInt(key) === clusters[i].id) {
            clusters[i].forecast = clusterForcast[key];
          }
        });
      }

      // fliter 溢出
      for (let i = clusters.length - 1; i >= 0; i--) {
        if (clusters[i].forecast && !clusters[i].forecast.forecast) {
          clusters.splice(i, 1);
        }
      }
      
      this.setState({
        listData: clusters,
        clusters: clusters,
      });
    } else {
      this.setState({ listData: pools });
    }
    this.renderCharts();
  }

  getColumns() {
    const columns = [];
    if (this.state.isShowAllCluster) {
      //所有集群
      columns.push(
        nameForecastColumn,
        clusterUsageRate,
        totalCapacityColumn,
        usedCapacityColumn,
        usedForcastColumn,
      );
    } else {
      if (this.state.isShowAllPool === false) {
        //单一存储池 TODO
        columns.push(
          nameForecastColumn,
          roleColumn,
          deviceTypeColumn,
          // getStatusColumn(POOL_STATUS),
          poolUsageRate,
          totalCapacityColumn,
          usedCapacityColumn,
        );
      } else {
        columns.push(
          nameForecastColumn,
          roleColumn,
          getStatusColumn(POOL_STATUS),
          poolUsageRate,
          totalCapacityColumn,
          usedCapacityColumn,
          usedForcastColumn,
        );
      }
    }
    return columns;
  }

  getXAxis(maxSamplesTimes) {
    const xAxis = lodash.merge({}, xAxisConfig, {
      type: 'time',
      boundaryGap: false,
      splitNumber: 12,
      axisLabel: {
        formatter: value => {
          if (value > maxSamplesTimes) return;
          return moment(value).format('MM DD');
        },
      },
    });
    return xAxis;
  }

  getSeries(data, isForecast) {
    let dataArray = [];
    const listData = this.state.listData;
    listData.map(item => {
      dataArray.push(item.name);
    });
    return Object.keys(data).map((prop, index) => {
      //TODO  (markPoint) 取最大值的90%此处为预警值 markPoint 小铃铛展示
      let color;
      if (index > 13) {
        index = 13;
      }
      if (isForecast) {
        color = CHART_FORECAST_COLOR;
      } else {
        color = ORDER_COLORS[index];
      }
      return lodash.merge({}, lineSeriesConfig, {
        name: dataArray[index],
        type: 'line',
        lineStyle: {
          color,
        },
        itemStyle: { color },
        areaStyle: { color: hexToRgba(color, 0.5) },
        data: data[prop],
      });
    });
  }

  tooltipFormatter(unit) {
    return params => {
      let tooltip = `<div class="${styles['tooltip-title']}">${moment(params[0].value[0]).format(
        'YYYY-MM-DD HH:mm:ss',
      )}</div>`;
      params.forEach(item => {
        let index = parseInt(item.seriesIndex, 10);
        if (index > 13) {
          index = 13;
        }
        let toolItem = `
        <div class="${styles['tooltip-item']}">
          <span class="${styles['tooltip-icon']}" style="background-color:${
          ORDER_COLORS[index]
        };"></span>
          <span class="${styles['tooltip-name']}">${item.seriesName}</span>
          <span class="${styles['tooltip-unit']}">${unit}</span>
          <span class="${styles['tooltip-count']}">${item.value[1]}</span>
        </div>
      `;
        tooltip += toolItem;
      });
      return tooltip;
    };
  }

  getTimesAndUnit(listData) {
    if (listData.length <= 0) return;
    let sampleListMaxArray = [];
    let sampleTimesMaxArray = [];
    let sampleTimesMinArray = [];
    //取最大值获得换算单位 MAXtimes  MINtimes
    listData.map(item => {
      if (item.forecast.samples && item.forecast.samples.length > 0) {
        let dataArray = [];
        let timesArray = [];
        item.forecast.samples.map(data => {
          timesArray.push(data[0]);
        });
        item.forecast.samples.map(data => {
          dataArray.push(data[1]);
        });
        const dataMax = lodash.max(dataArray);
        sampleListMaxArray.push(dataMax);
        const itemMax = lodash.max(timesArray);
        sampleTimesMaxArray.push(itemMax);
        const itemMin = lodash.min(timesArray);
        sampleTimesMinArray.push(itemMin);
      }
    });
    const maxSamplesData = lodash.max(sampleListMaxArray); //sample max value
    const unit = convertBytes({ value: maxSamplesData }).unit;
    const maxSamplesTimes = lodash.max(sampleTimesMaxArray); //sample max times
    const minSamplesTimes = lodash.min(sampleTimesMinArray); //sample min times

    let forecastTimesMaxArray = [];
    let forecastTimesMinArray = [];
    //取最大值获得换算单位 MAXtimes  MINtimes

    listData.map(item => {
      if (item.forecast.forecast && item.forecast.forecast.length > 0) {
        let timesArray = [];
        item.forecast.forecast.map(data => {
          timesArray.push(data[0]);
        });
        const itemForeMax = lodash.max(timesArray);
        forecastTimesMaxArray.push(itemForeMax);
        const itemForeMin = lodash.min(timesArray);
        forecastTimesMinArray.push(itemForeMin);
      }
    });
    const maxForecastTimes = lodash.max(forecastTimesMaxArray); //forecast max times
    const minForecastTimes = lodash.max(forecastTimesMinArray); //forecast min times
    const timeScale = (maxSamplesTimes - minSamplesTimes) / (maxForecastTimes - minForecastTimes);
    return {
      unit: unit,
      timeScale: timeScale,
      minForecastTimes: minForecastTimes,
      maxSamplesTimes: maxSamplesTimes,
    };
  }

  getChartSeries(listData) {
    const timesAndUnit = this.getTimesAndUnit(this.state.listData);
    if (!timesAndUnit) return;
    let samplesData = [];
    let forcastData = [];
    listData.map(item => {
      if (item.forecast.samples && item.forecast.samples.length > 0) {
        samplesData.push(
          item.forecast.samples.map(sitem => {
            const samplesUnitData = convertBytes({
              value: sitem[1],
              needInt: true,
              targetUnit: timesAndUnit.unit,
            });
            return (sitem = [sitem[0], samplesUnitData]);
          }),
        );
      }

      if (item.forecast.forecast && item.forecast.forecast.length > 0) {
        let timesDeviation = 0;
        if (item.forecast.forecast[0][0] !== timesAndUnit.minForecastTimes) {
          timesDeviation = item.forecast.forecast[0][0] - timesAndUnit.minForecastTimes;
        }

        forcastData.push(
          item.forecast.forecast.map((fitem, index) => {
            const forecastUnitData = convertBytes({
              value: fitem[1],
              needInt: true,
              targetUnit: timesAndUnit.unit,
            });
            // 当预测值与样本值连接起来时候需稍微增加点间隙，防止在接触点出hover时出现值重复
            if (index === 0) return [timesAndUnit.maxSamplesTimes + 1000, forecastUnitData];
            return (fitem = [
              parseInt(
                (fitem[0] - timesAndUnit.maxSamplesTimes - timesDeviation) * timesAndUnit.timeScale +
                  timesAndUnit.maxSamplesTimes,
                10,
              ),
              forecastUnitData,
            ]);
          }),
        );
      }
    });

    return {
      samplesData: samplesData,
      forcastData: forcastData,
    };
  }

  renderCharts() {
    if (!this.state.haveForecast) return
    if (!this.chart) {
      this.chart = echarts.init(document.querySelector(`.${this.state.chartIdentity}`));
    }
    const timesAndUnit = this.getTimesAndUnit(this.state.listData);
    if (!timesAndUnit) return;
    const chartSeries = this.getChartSeries(this.state.listData);
    if (!chartSeries) return;
    const chartSamplesData = this.getSeries(chartSeries.samplesData);
    const chartForcastData = this.getSeries(chartSeries.forcastData, true);
    const series = lodash.concat(chartSamplesData, chartForcastData);

    const option = {
      grid: this.grid,
      tooltip: {
        trigger: 'axis',
        backgroundColor: CHART_TOOLTIP_BACKGROUND_COLOR,
        axisPointer: { lineStyle: { type: 'dashed', color: CHART_TOOLTIP_LINE_COLOR } },
        formatter: this.tooltipFormatter(timesAndUnit.unit),
        confine: true,
      },
      xAxis: this.getXAxis(timesAndUnit.maxSamplesTimes),
      yAxis: {
        type: 'value',
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          formatter: value => {
            return `${value} ${timesAndUnit.unit}`;
          },
        },
      },
      series: series,
    };
    this.chart.setOption(option, true); //echart 刷新
  }

  handleMenuChangeCluster = (key, option) => {
    const { clusters } = this.props;
    const { props } = option;
    if (key === 'all') {
      this.setState({
        cluserId: null,
        cluserName: t('所有集群'),
        isPoolDropdown: true,
        isShowAllCluster: true,
      });
      //TODO缓存
      let ids = [];
      for (let i = 0, l = clusters.length; i < l; i++) {
        ids.push(clusters[i].id);
      }
      this.getForecastDatas('cluster', ids);
      return false;
    }
    let ids = [key];
    this.setState({
      isPoolDropdown: false,
      isShowAllCluster: false,
      cluserId: key,
      cluserName: props.children,
      poolRemainDays: '--',
      poolsForcastData: [],
      selPoolExpan: t('请选择存储池'),
    });
    this.getForecastDatas('cluster', ids);
  };

  //按存储池选择  TD
  handleMenuChangePool = (key, option) => {
    const { props } = option;
    if (key === 'all') {
      return;
    }
    this.setState({
      poolName: props.children,
      isShowAllPool: false,
    });
    this.getForecast('pool', key);
  };

  renderCluseterCapacityChart() {
    const clusters = this.state.clusters;
    const Option = Select.Option;
    const clusterMenu = (
      <Select
        defaultValue={this.state.cluserName || t('所有集群')}
        onChange={this.handleMenuChangeCluster}
        className={styles['select-option']}
      >
        <Option key="all">{t('所有集群')}</Option>
        {clusters.map(item => {
          return <Option key={item.id}>{item.name}</Option>;
        })}
      </Select>
    );

    const poolMenu = (
      <Select
        defaultValue={this.state.poolName || t('所有存储池')}
        disabled={this.state.isPoolDropdown}
        onChange={this.handleMenuChangePool}
        className={styles['select-option']}
      >
        <Option key="all">{t('所有存储池')}</Option>
        {this.state.pools.map(item => {
          return <Option key={item.id}>{item.name}</Option>;
        })}
      </Select>
    );

    let cluster = null;
    const clusterId = this.state.cluserId;
    let forcastClusters = this.state.clusters;
    forcastClusters.map(item => {
      if (item.id === parseInt(clusterId)) {
        cluster = item;
      }
    });

    let clusterSelect = null;
    if (cluster) {
      const cUsedDataByte = lodash.get(cluster, 'samples[0].used_kbyte', 0);
      const cTotalDataByte = lodash.get(cluster, 'samples[0].total_kbyte', 0);
      const cUsedData = convertBytes({ value: cUsedDataByte });
      const cTotalData = convertBytes({ value: cTotalDataByte });
      const cClass =
        cluster.forecast.availableDays <= 14
          ? 'cluster-date-risk'
          : cluster.forecast.availableDays <= 30
          ? 'cluster-date-warning'
          : 'cluster-date-regular';
      clusterSelect = (
        <div className={styles['cluster-data-cluster']}>
          <div className={styles['cluster-data-list']}>
            <div>
              <span className={styles['cluster-data-name']}>{cluster.name}</span>
            </div>
            <div>
              {cUsedData.value}
              <span className={styles['cluster-list-unit']}>{cUsedData.unit}</span>/
              {cTotalData.value}
              <span className={styles['cluster-list-unit']}>{cTotalData.unit}</span>
            </div>
            {cluster.forecast.availableDays >= 365 ? (
              <div className={styles[cClass]}>
                <span>{t('一年后写满')}</span>
              </div>
            ) : (
              <div className={styles[cClass]}>
                <span className={styles['font-notice']}>{cluster.forecast.availableDays}</span>
                <span>{t('天内写满')}</span>
              </div>
            )}
          </div>
          <hr />
        </div>
      );
    }
    return (
      <div>
        <div className={styles['forcast-used-chart']}>
          <div>
            <span className={styles['forcast-header']}>{t('集群容量使用预估')}</span>
            <Tooltip title={t('监控数据七天后开始预估')} placement="right">
              <i className={`${styles['tips']} icon-tips`} />
            </Tooltip>
          </div>
          <div className={styles['forcast-chart']}>
            <EchartsContainer
              resize={this.renderCharts}
              className={`${styles.chart} ${this.state.chartIdentity}`}
            />
            <div className={styles['chart-xAxis']}>
              <Icon type="arrow-left" />
              <span className={styles['chart-xAxis-left']} />
              <span>{t('180天')}</span>
              <span className={styles['chart-xAxis-right']} />
              <Icon type="arrow-right" />
            </div>
          </div>
        </div>
        <div className={styles['forcast-used-list']}>
          <div className={styles['cluster-and-pool-dropdown']}>
            {clusterMenu}
            {poolMenu}
          </div>
          <div style={{ clear: 'both' }} />
          <div className={styles['font-bold']}>{moment(new Date()).format('YYYY-MM-DD')}</div>
          {cluster && clusterSelect}
          <div className={styles['forcast-used-list-data']}>
            {this.state.listData.length > 0 &&
              this.state.listData.map((item, index) => {
                const usedDataByte = lodash.get(item, 'samples[0].used_kbyte', 0);
                const totalDataByte = lodash.get(item, 'samples[0].total_kbyte', 0);
                const usedData = convertBytes({ value: usedDataByte });
                const totalData = convertBytes({ value: totalDataByte });
                const cluserDateClass =
                  item.forecast.availableDays <= 14
                    ? 'cluster-date-risk'
                    : item.forecast.availableDays <= 30
                    ? 'cluster-date-warning'
                    : 'cluster-date-regular';
                return (
                  <div key={item.id} className={styles['cluster-data-list']}>
                    <div>
                      <span
                        className={styles['cluster-data-color']}
                        style={{ backgroundColor: `${ORDER_COLORS[index]}` }}
                      />
                      <span className={styles['cluster-data-name']} title={item.name}>
                        {item.name}
                      </span>
                    </div>
                    <div>
                      {usedData.value}
                      <span className={styles['cluster-list-unit']}>{usedData.unit}</span>/
                      {totalData.value}
                      <span className={styles['cluster-list-unit']}>{totalData.unit}</span>
                    </div>
                    <div className={styles[cluserDateClass]}>
                      <span className={styles['font-notice']}>{item.forecast.availableDays}</span>
                      {t('天内写满')}
                    </div>
                    {item.forecast.availableDays >= 365 ? (
                      <div className={styles[cluserDateClass]}>{t('一年后写满')}</div>
                    ) : (
                      <div />
                    )}
                  </div>
                );
              })}
          </div>
        </div>
        <div style={{ clear: 'both' }} />
      </div>
    );
  }

  renderCluseterCapacityUsed() {
    const columns = this.getColumns();
    const count = this.state.listData.length;
    return (
      <div className={styles['forcast-table']}>
        <div>
          <div className={styles['table-item-title']}>
            {this.state.isShowAllCluster === true ? t('集群容量使用') : t('存储池容量使用')}
          </div>
          <div className={styles['table-item-count']}>{`共 ${count} 个`}</div>
          <div style={{ clear: 'both' }} />
        </div>
        <div className={styles['table-item-table']}>
          <Table columns={columns} dataSource={this.state.listData} />
        </div>
      </div>
    );
  }

  handleMenuClickPoolToCalcuDays = (e, option) => {
    const { props } = option;
    if (e === 'all') {
      this.setState({
        selPoolExpan: t('所有存储池'),
        poolRemainDays: '--',
      });
      return;
    }
    let listData = this.state.listData;
    for (let i in listData) {
      if (listData[i].id === e) {
        this.setState({ poolRemainDays: listData[i].forecast.availableDays });
      }
    }
    this.setState({ selPoolExpan: props.children });
  };

  async handleExpandPool(value) {
    const id = this.state.cluserId;
    const func = lodash.throttle(() => {
      return this.getForcastToExpan('cluster', id, value, 'd'); // eslint-disable-line
    }, 500);
    const back = await func();
    if (back.forecast) {
      let forcastValue = [];
      back.forecast.map(item => {
        forcastValue.push(item[1]);
      });
      const data = lodash.max(forcastValue);
      const addData = convertBytes({ value: data });
      this.setState({ poolAddDB: `${addData.value} ${addData.unit}` });
    }
  }

  clickCollapse(e) {
    this.setState({ collapsePanleOpen: parseInt(e, 10) });
  }

  renderCluseterCapacityForcast() {
    const Panel = Collapse.Panel;
    const Option = Select.Option;
    let listData = this.state.listData;
    let lessMonthPools = [];
    for (let i = 0, il = listData.length; i < il; i++) {
      if (
        listData[i].forecast &&
        listData[i].forecast.availableDays &&
        listData[i].forecast.availableDays <= 30
      ) {
        lessMonthPools.push(listData[i]);
      }
    }

    const expanPoolMenu = (
      <Select
        defaultValue={this.state.selPoolExpan || t('所有存储池')}
        disabled={this.state.isPoolDropdown}
        onChange={this.handleMenuClickPoolToCalcuDays}
        className={styles['select-option']}
      >
        <Option key="all">{t('所有存储池')}</Option>
        {lessMonthPools.map(item => {
          return <Option key={item.id}>{item.name}</Option>;
        })}
      </Select>
    );

    let cluster = null;
    const clusterId = this.state.cluserId;
    let forcastClusters = this.state.clusters;
    forcastClusters.map(item => {
      if (item.id === parseInt(clusterId)) {
        cluster = item;
      }
    });
    let lessTwoWeek = [];
    let lessOneMonth = [];
    let lessThrMonth = [];
    let lessSixMonth = [];
    let moreSixWeek = [];
    for (let i = 0, il = this.state.poolsData.length; i < il; i++) {
      if (this.state.poolsData[i].forecast && this.state.poolsData[i].forecast.availableDays) {
        this.state.poolsData[i].forecast.availableDays <= 14
          ? lessTwoWeek.push(this.state.poolsData[i])
          : this.state.poolsData[i].forecast.availableDays <= 30
          ? lessOneMonth.push(this.state.poolsData[i])
          : this.state.poolsData[i].forecast.availableDays <= 90
          ? lessThrMonth.push(this.state.poolsData[i])
          : this.state.poolsData[i].forecast.availableDays <= 180
          ? lessSixMonth.push(this.state.poolsData[i])
          : moreSixWeek.push(this.state.poolsData[i]);
      }
    }

    const dataTypeArray = [t('2 周内'), t('1 个月内'), t('3 个月内'), t('6 个月内'), t('6 个月后')];
    const dataItemArray = [lessTwoWeek, lessOneMonth, lessThrMonth, lessSixMonth, moreSixWeek];
    const usedForcastModel = dataTypeArray.map((item, index) => {
      return {
        dayType: item,
        type: index,
        count: dataItemArray[index].length,
        item: dataItemArray[index],
      };
    });

    const collapseStyle = {
      border: 0,
      padding: 0,
    };
    const cluserDateClass =
      this.state.poolRemainDays <= 14
        ? 'cluster-date-risk'
        : this.state.poolRemainDays <= 30
        ? 'cluster-date-risk'
        : 'cluster-date-regular';
    return (
      <div className={styles['forcast-notice']}>
        {this.state.isShowAllCluster === true ? (
          <div>
            <div className={styles['forcast-header']}>{t('存储池容量使用预估')}</div>
            <div>
              <Collapse bordered={false} onChange={e => this.clickCollapse(e)}>
                {usedForcastModel.map((clusterItem, index) => {
                  const poolForCorClass =
                    clusterItem.type === 0
                      ? 'cluster-date-risk'
                      : clusterItem.type === 1
                      ? 'cluster-date-warning'
                      : 'cluster-date-regular';
                  const poolForBorClass =
                    clusterItem.type === 0
                      ? 'cluster-date-risk-border'
                      : clusterItem.type === 1
                      ? 'cluster-date-warning-border'
                      : 'cluster-date-regular-border';
                  return (
                    <Panel
                      style={collapseStyle}
                      showArrow={false}
                      key={index}
                      header={
                        <div className={styles['pool-forcast-header']}>
                          <span className={styles['pool-forcast-header-title']}>
                            {clusterItem.dayType}
                          </span>
                          <span
                            className={`${styles['pool-forcast-header-count']}  ${
                              styles[poolForBorClass]
                            }`}
                          >
                            {clusterItem.count}
                          </span>
                          <span className={styles['pool-forcast-header-icon']}>
                            {lodash.indexOf(this.state.collapsePanleOpen, index) < 0 ? (
                              <Icon type="up" />
                            ) : (
                              <Icon type="down" />
                            )}
                          </span>
                        </div>
                      }
                    >
                      {clusterItem.item.length > 0 &&
                        clusterItem.item.map(poolItem => {
                          return (
                            <div key={poolItem.id} className={styles['pool-forcast-panel']}>
                              <div className={styles['pool-forcast-panel-header']}>
                                <div>
                                  {poolItem.name}({poolItem.name})
                                </div>
                                <div className={styles[poolForCorClass]}>
                                  {poolItem.forecast.availableDays}
                                  {t('天写满')}
                                </div>
                              </div>
                              <div>
                                <div className={styles['pool-forcast-item-bar']}>
                                  <PercentBar
                                    total={poolItem.samples[0].total_kbyte}
                                    used={poolItem.samples[0].used_kbyte}
                                  />
                                </div>
                                <div className={styles['pool-forcast-item-rate']}>
                                  {(
                                    (poolItem.samples[0].used_kbyte /
                                      poolItem.samples[0].total_kbyte) *
                                    100
                                  ).toFixed(0)}
                                  %
                                </div>
                                <div style={{ clear: 'both' }} />
                              </div>
                            </div>
                          );
                        })}
                    </Panel>
                  );
                })}
              </Collapse>
            </div>
          </div>
        ) : (
          <div className={styles['suggest-panel']}>
            <div className={styles['suggest-panel-header']}>
              <div className={styles['forcast-header']}>{t('扩容建议')}</div>
              <div>
                <a
                  className={styles['link']}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={cluster.access_url ? cluster.access_url : null}
                >
                  <Icon type="arrow-right" className={styles['link-iocn']} />
                  <span>{t('登录该集群')}</span>
                </a>
              </div>
            </div>
            <div className={styles['suggest-info']}>
              {t('经预估分析，以下存储池将在一个月内写满，建议对以上存储池进行扩容操作')}
            </div>
            <div className={styles['suggest-pool-list']}>
              {lessMonthPools.length > 0 &&
                lessMonthPools.map(item => {
                  return <div key={item.id}>{item.name}</div>;
                })}
            </div>
            <div className={styles['suggest-notice']}>{t('可以通过以下工具预估所需扩容容量')}:</div>
            <div className={styles['suggest-pool-capacity']}>
              <span>{expanPoolMenu}</span>
              <span>{t('将在')}</span>
              <span className={styles[cluserDateClass] + ' ' + styles['font-notice']}>
                {t('{{day}} 天内写满', { day: this.state.poolRemainDays })}
              </span>
            </div>
            <div className={styles['suggest-add-capacity']}>
              <span>{t('延长使用')}</span>
              <InputNumber
                min={1}
                max={10000}
                placeholder={t('请输入')}
                className={styles['input-number']}
                onChange={e => this.handleExpandPool(e)}
              />
              <span>
                {t('天,需扩容')}
                <span className={styles['font-notice']}>{this.state.poolAddDB}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
  render() {
    return (
      <div className={styles['capacity-forcas']}>
      {this.state.haveForecast ? (
        <div>
          <div className={styles['chart-panel']}>{this.renderCluseterCapacityChart()}</div>
          <div className={styles['capacity-used-and-sug']}>
            <div className={styles['cluster-used-panel']}>{this.renderCluseterCapacityUsed()}</div>
            <div className={styles['pool-used-panel']}>{this.renderCluseterCapacityForcast()}</div>
          </div>
        </div>
      ) : (
        <div className={styles['no-forecast-data']}>
          <div>
            <img src={require('../../assets/no-forecast-data.png')} />
          </div>
          <h3>{t('暂无分析数据，集群接入7天后展示分析数据。')}</h3>
        </div>
      )}
      </div>
    );
  }
}
CapacityAnalysis.propTypes = {
  clusters: PropTypes.array,
};
