import { Injectable } from '@angular/core';
// import { AngularFireStorage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  // constructor(private firebaseStorage: AngularFireStorage) { }

  // uploadImageToFirebase(bucket: string, imageBase64: any){
  //   return new Promise<any>((resolve, reject) => {
  //     let storageRef = this.firebaseStorage.storage.ref();
  //     let imageRef = storageRef.child(bucket).child(Math.random().toString().substr(2, 5));
  //     imageRef.putString(imageBase64, 'data_url')
  //       .then(snapshot => {
  //         snapshot.ref.getDownloadURL().then(res => resolve(res))
  //       }, err => {
  //         reject(err);
  //       })
  //   });
  // }
}
