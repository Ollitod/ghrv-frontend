import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../services/http.service';
import {StatReduced} from '../../models/stat';
import {Label} from 'ng2-charts';
import {ChartDataSets, ChartOptions} from 'chart.js';
import {MatSelectChange} from '@angular/material/select';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {
  stats: Map<string, StatReduced[]>;
  chartLabels: Label[] = [];
  chartData: ChartDataSets[] = [];
  initFinished = false;
  allKeys: string[] = [];
  selectedKeys: string[] = [];

  public chartOptions: ChartOptions = {
    responsive: true,
    scales: {
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Date'
        },
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'YYYY-MM-DD'
          }
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Total views'
        }
      }]
    },
    tooltips: {
      enabled: true,
      mode: 'single',
      callbacks: {
        label: (tooltipItems, data) => {


          console.log(data);
          return tooltipItems.yLabel + ' : ' + tooltipItems.xLabel + ' Files';
        }
      }
    }
  };

  constructor(private httpService: HttpService) {
  }

  ngOnInit(): void {
    this.httpService.findAllGrouped().subscribe(
      data => {
        this.stats = data;
        this.allKeys = Object.keys(this.stats).sort();
        this.selectedKeys = this.allKeys;
        // this.initChart('count');
        this.initChart('uniques');
      },
      error => {
        console.error(error);
      }
    );
  }

  initChart(property: string | 'count' | 'uniques') {
    let min = new Date().getTime();
    let max = 0;

    for (const key of this.selectedKeys) {

      const temp = {
        label: key, data: [], lineTension: 0.2, fill: false
      };

      for (const statReduced of this.stats[key]) {
        temp.data.push({x: new Date(statReduced.date).toDateString(), y: statReduced[property]});
        if (statReduced.date < min) {
          min = statReduced.date;
        } else if (statReduced.date > max) {
          max = statReduced.date;
        }
      }
      this.chartData.push(temp);
    }

    for (let i = min; i <= max; i += 86400000) {
      this.chartLabels.push(new Date(i).toString());
    }

    this.initFinished = true;
  }

  handleChange(event: MatSelectChange) {
    this.initFinished = false;
    this.chartData = [];
    this.chartLabels = [];
    this.selectedKeys = event.value;
    // this.initChart('count');
    this.initChart('uniques');
  }
}
