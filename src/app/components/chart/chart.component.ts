import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../services/http.service';
import {StatReduced} from '../../models/stat';
import {Label} from 'ng2-charts';
import {ChartDataSets, ChartOptions} from 'chart.js';
import {MatSelectChange} from '@angular/material/select';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})

export class ChartComponent implements OnInit {
  stats: Map<string, StatReduced[]>;
  topStats: Map<string, number> = new Map<string, number>();
  chartLabels: Label[] = [];
  chartData: ChartDataSets[] = [];
  initFinished = false;
  allRepos: string[] = [];
  selectedRepos: string[] = [];
  currentMode = 'count';
  bestReposN = 5;

  public chartOptions: ChartOptions;

  constructor(private httpService: HttpService, private snackBarController: MatSnackBar) {
  }

  ngOnInit(): void {

    this.httpService.findAllGrouped().subscribe(
      data => {
        this.stats = data;
        this.allRepos = Object.keys(this.stats).sort();

        for (const key of this.allRepos) {
          let cnt = 0;
          for (const statReduced of this.stats[key]) {
            cnt += statReduced.count;
          }
          this.topStats.set(key, cnt);
        }

        this.initChartOptions();
        this.filterBestN();

      },
      error => {
        console.error(error);
      }
    );
  }

  initChart(): void {
    let min = new Date().getTime();
    let max = 0;

    for (const key of this.selectedRepos) {
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

  onSelectChanged(event: MatSelectChange): void {
    this.clearVariables();
    this.selectedRepos = event.value;
    this.initChart();
  }

  onCurrentModeChange(): void {
    this.clearVariables();
    this.initChartOptions();
    this.initChart();
  }

  onSelectAllClicked(): void {
    this.selectedRepos = this.allRepos;
    this.clearVariables();
    this.initChart();
  }

  onDeselectAllClicked(): void {
    this.selectedRepos = [];
    this.clearVariables();
    this.initChart();
  }

  clearVariables(): void {
    this.initFinished = false;
    this.chartData = [];
    this.chartLabels = [];
  }

  private initChartOptions(): void {
    this.chartOptions = {
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
            labelString: (this.currentMode === 'count' ? 'Total' : 'Unique') + ' views'
          }
        }]
      },
    };
  }

  filterBestN(): void {
    console.log(this.bestReposN);

    this.clearVariables();
    this.topStats = new Map([...this.topStats.entries()].sort((pair1, pair2) => pair2[1] - pair1[1]));
    this.selectedRepos = Array.from({length: +this.bestReposN}, function() {
      return this.next().value;
    }, this.topStats.keys());

    this.initChart();
  }

  isValidBestReposN(): boolean {
    return !(!this.bestReposN || this.bestReposN < 1 || this.bestReposN > this.allRepos.length);
  }
}
