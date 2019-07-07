import { DocumentPicker} from "react-native-document-picker";

DocumentPicker.types.allFiles
DocumentPicker.types.audio
DocumentPicker.types.images
DocumentPicker.types.plainText
DocumentPicker.types.video

DocumentPicker.pick({
  type: [DocumentPicker.types.allFiles]
})