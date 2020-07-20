import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../services/http.service';
import {StatReduced} from '../../models/stat';
import {Label} from 'ng2-charts';
import {ChartDataSets, ChartOptions} from 'chart.js';
import {MatSelectChange} from '@angular/material/select';
import {MatButtonToggleChange} from '@angular/material/button-toggle';

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
  currentMode = 'count';

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
  };

  constructor(private httpService: HttpService) {
  }

  ngOnInit(): void {
    this.httpService.findAllGrouped().subscribe(
      data => {
        this.stats = data;
        this.allKeys = Object.keys(this.stats).sort();
        this.selectedKeys = this.allKeys;
        this.initChart();
      },
      error => {
        console.error(error);
      }
    );
  }

  initChart() {
    let min = new Date().getTime();
    let max = 0;

    for (const key of this.selectedKeys) {

      const temp = {
        label: key, data: [], lineTension: 0.2, fill: false
      };

      for (const statReduced of this.stats[key]) {
        temp.data.push({x: new Date(statReduced.date).toDateString(), y: statReduced[this.currentMode]});
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
    this.clearVariables();
    this.selectedKeys = event.value;
    this.initChart();
  }

  modeChange(event: MatButtonToggleChange) {
    this.clearVariables();

    // To update the label on the y-Axis, it is necessary to reset all the options of scales
    this.chartOptions = {
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
            labelString: (this.currentMode === 'count' ? 'Total' : 'Unique') + ' views'
          }
        }]
      }
    };
    this.initChart();
  }

  // onButtonClicked(event: MouseEvent) {
  //   const btnId: string = (event.target as Element).id;
  //   if (btnId === 'btnSelect') {
  //     this.selectedKeys = this.allKeys;
  //   } else if (btnId === 'btnUnselect') {
  //     this.selectedKeys = [];
  //   }
  //   this.clearVariables();
  //   this.initChart();
  // }

  selectClicked(event: MouseEvent) {
    this.selectedKeys = this.allKeys;
    this.clearVariables();
    console.log(event);
    this.initChart();
  }

  unselectClicked(event: MouseEvent) {
    this.selectedKeys = [];
    this.clearVariables();
    this.initChart();
  }

  clearVariables() {
    this.initFinished = false;
    this.chartData = [];
    this.chartLabels = [];
  }
}
