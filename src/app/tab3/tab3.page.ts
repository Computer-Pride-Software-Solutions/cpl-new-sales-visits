import { Component, OnInit } from '@angular/core';
import { DexieService} from '../services/Database/Dexie/dexie.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  allDraftReports = [];
  hint: string = '';
  constructor(private db: DexieService) { }

  ngOnInit() {
    this.searchDraftReports();
  }

    // Refreshing page
    doRefresh(event) {
      // Begin async operation
      this.searchDraftReports();
      setTimeout(() => {
        // Async operation has ended
        event.target.complete();
      }, 2000);
    }

  async searchDraftReports(event = null){
    let hint = (event)? event.target.value.toString().toLowerCase(): '';
    var regex = new RegExp(hint);
    var reports = await this.db.draftReport.filter(report => regex.test(report.clientName.toLowerCase())).toArray();
    this.allDraftReports = reports;
  }

  clearAllDraftReports(){
    this.db.draftReport.clear();
    this.allDraftReports = [];
  }

  deleteAllSentDraftReports(){
    this.db.draftReport.where("status").equals("Sent").modify((value, ref) => {
      delete ref.value;
      this.searchDraftReports();
    });
  }



}
