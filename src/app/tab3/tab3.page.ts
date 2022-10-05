import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { UserDialogsService } from '../services/common/user-dialogs/user-dialogs.service';
import { DexieService} from '../services/Database/Dexie/dexie.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

  allDraftReports = [];
  hint: string = '';
  constructor(
    private db: DexieService,
    public alertController: AlertController,
    private dialoService: UserDialogsService
    ) { }

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
    const self = this;
    this.dialoService.confirm('Did you mean to clear your Outbox? All your reports will be deleted!', 'Clear Outbox!', function(){
      self.db.draftReport.clear();
      self.allDraftReports = [];
    })
  }
  
  deleteAllSentDraftReports(){
    const self = this;
    this.dialoService.confirm('Did you mean to delete all sent reports from your draft?', 'Deleting all sent reports!', function(){
      self.db.draftReport.where("status").equals("Sent").modify((value, ref) => {
        delete ref.value;
        self.searchDraftReports();
      });
    })
  }


}
