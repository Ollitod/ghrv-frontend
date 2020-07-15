import {Component, OnInit} from '@angular/core';
import {HttpService} from '../../services/http.service';
import {StatReduced} from '../../models/stat';
import {Label} from 'ng2-charts';
import {ChartDataSets, ChartOptions} from 'chart.js';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {
  stats: Map<string, StatReduced[]>;

  chartLabels: Label[] = [];
  chartData: ChartDataSets[] = [];
  shouldDisplay = false;

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
    }
  };

  constructor(private httpService: HttpService) {
  }

  ngOnInit(): void {
    this.httpService.findAllGrouped().subscribe(
      data => {
        this.stats = data;

        let min = new Date().getTime();
        let max = 0;

        for (const key of Object.keys(this.stats)) {

          const temp = {
            label: key, data: []
          };

          for (const statReduced of this.stats[key]) {
            temp.data.push({x: new Date(statReduced.date).toLocaleDateString(), y: statReduced.count});

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

        this.shouldDisplay = true;
      },
      error => {
        console.error(error);
      }
    );

  }

}
