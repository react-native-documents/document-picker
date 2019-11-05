import DocumentPicker from "react-native-document-picker";

// Option is correct about pick
DocumentPicker.pick({
  type: [DocumentPicker.types.allFiles]
})

DocumentPicker.pick({
  type: [DocumentPicker.types.audio]
})

DocumentPicker.pick({
  type: [DocumentPicker.types.images]
})

DocumentPicker.pick({
  type: [DocumentPicker.types.plainText]
})

DocumentPicker.pick({
  type: [DocumentPicker.types.video]
})

DocumentPicker.pick({
  type: [DocumentPicker.types.pdf]
})
DocumentPicker.pick({
  type: [DocumentPicker.types.doc]
})

DocumentPicker.pick({
  type: [DocumentPicker.types.docx]
})

DocumentPicker.pick({
  type: [DocumentPicker.types.xls]
})

DocumentPicker.pick({
  type: [DocumentPicker.types.xlsx]
})

DocumentPicker.pick({
  type: [DocumentPicker.types.ppt]
})

DocumentPicker.pick({
  type: [DocumentPicker.types.pptx]
})

DocumentPicker.pick({
  type: [DocumentPicker.types.video,DocumentPicker.types.pdf, 'public.audio', DocumentPicker.types.doc, DocumentPicker.types.docx, DocumentPicker.types.ppt, DocumentPicker.types.pptx, DocumentPicker.types.xls, DocumentPicker.types.xlsx]
})

// Option is correct about pickMultiple

DocumentPicker.pickMultiple({
  type: [DocumentPicker.types.allFiles]
})

DocumentPicker.pickMultiple({
  type: [DocumentPicker.types.allFiles]
})

DocumentPicker.pickMultiple({
  type: [DocumentPicker.types.audio]
})

DocumentPicker.pickMultiple({
  type: [DocumentPicker.types.images]
})

DocumentPicker.pickMultiple({
  type: [DocumentPicker.types.plainText]
})

DocumentPicker.pickMultiple({
  type: [DocumentPicker.types.video]
})

DocumentPicker.pickMultiple({
  type: [DocumentPicker.types.pdf]
})

DocumentPicker.pickMultiple({
  type: [DocumentPicker.types.doc]
})

DocumentPicker.pickMultiple({
  type: [DocumentPicker.types.docx]
})

DocumentPicker.pickMultiple({
  type: [DocumentPicker.types.ppt]
})

DocumentPicker.pickMultiple({
  type: [DocumentPicker.types.pptx]
})

DocumentPicker.pickMultiple({
  type: [DocumentPicker.types.xls]
})

DocumentPicker.pickMultiple({
  type: [DocumentPicker.types.xlsx]
})

DocumentPicker.pickMultiple({
  type: [DocumentPicker.types.video,DocumentPicker.types.pdf, 'public.audio', DocumentPicker.types.ppt, DocumentPicker.types.pptx, DocumentPicker.types.doc, DocumentPicker.types.docx, DocumentPicker.types.xls, DocumentPicker.types.xlsx]
})

DocumentPicker.pick({type: 'image/jpg'});
DocumentPicker.pick({type: 'public.png'});

DocumentPicker.pick({type: ['image/jpg', 'image/jpeg', 'image/png', 'application/pdf', 'application/doc', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' | 'application/vnd.ms-excel' | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']});
DocumentPicker.pick({type: ['public.png', 'public.jpeg']});


try {
  throw new Error('test')
} catch (e) {
  if(DocumentPicker.isCancel(e)){

  } else {

  }
}
