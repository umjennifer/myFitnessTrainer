import React, { useState } from 'react';
import { Button, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../../firebaseConfig';
import { getDocumentId, updateFieldValueInDocument } from "../../databaseFunctions";

import AvatarPreview from '../components/AvatarPreview';

const pickedImageFileName = Date.now() + ".png";
const defaultAvatarFileName = "default.png";


const AvatarScreen = ({navigation}) =>  {
  const [defaultImageURL, setDefaultImageURL] = useState(null)
  const [avatarURL, setAvatarURL] = useState(null)
  const [image, setImage] = useState(null);


  // get the default.png from Firebase. We'll use its URL as the User's Avatar URL if
  // custom image is not picked from the user's device
  const defaultImageRef = ref(storage, defaultAvatarFileName);
  console.log("defaultImageRef=", defaultImageRef);
  getDownloadURL(defaultImageRef)
    .then((url) => {
      setDefaultImageURL(url);
      setAvatarURL(url);
    });


  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const saveAvatarSelection = async () => {

    const userId = await getDocumentId(
      "users",
      "email",
      auth.currentUser.email
    );

    if (image){ // if user picked an image from their device
      // upload image to Firebase
      // https://github.com/expo/examples/blob/master/with-firebase-storage-upload/App.js#L178-L205
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function (e) {
          console.log(e);
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", image, true);
        xhr.send(null);
      });
      // save image from device as pickedImageFileName
      const fileRef = ref(getStorage(), pickedImageFileName);
      await uploadBytes(fileRef, blob);
      blob.close();

      // get URL of avatar.png
      const pickedImageRef = ref(storage, pickedImageFileName);
      getDownloadURL(pickedImageRef)
        .then((url) => {
          // set user's avatar URL as the URL of avatar.png
          setAvatarURL(url);
        });
      console.log("image was picked; avatarURL=", avatarURL)
    
    // let newStorageLocation = "gs://" + pickedImageRef._location.bucket + "/" + pickedImageFileName;
    // Ex: newStorageLocation = gs://myfitnesstrainer-94289.appspot.com/avatar.png
    // console.log("newStorageLocation=", newStorageLocation);
    await updateFieldValueInDocument("users", userId, "avatar_file_name", pickedImageFileName);

    } 
    else {
      // TODO: this section is mainly for debugging. Erase this else section when we implement 
      // functionality to update the User's avatar image URL attribute

      console.log("no image was picked; using default. avatarURL=", avatarURL);
      // let storageLocation = "gs://" + defaultImageRef._location.bucket + "/" + defaultAvatarFileName;
      // console.log("storageLocation=", storageLocation);
      await updateFieldValueInDocument("users", userId, "avatar_file_name", defaultAvatarFileName);

    }
    navigation.navigate("Dashboard")
  };

  let imgSource;
  image ? imgSource = image : imgSource = defaultImageURL;  // checks if (picked) image is null
  return (
    <View style={styles.view}>
      <Text>Stick with the default avatar, or select your own!</Text>
      <AvatarPreview 
        imgSource={imgSource} 
        pixelSize={200} 
      />
      <Button 
        title="Change avatar" 
        onPress={pickImage} 
      />
      <TouchableOpacity style={styles.button} onPress={saveAvatarSelection}>
          <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

export default AvatarScreen;

const styles = StyleSheet.create({
  view: {
    flex: 1, 
    alignItems: "center",
    justifyContent: "center"
  },
  button: {
      backgroundColor: "#4682B4",
      width: "75%",
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 40,
  },
  buttonText: {
      color: "white",
      fontWeight: 800,
      fontSize: 16,
  },
});
