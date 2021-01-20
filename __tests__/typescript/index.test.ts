import DocumentPicker from 'react-native-document-picker';

// Option is correct about pick
DocumentPicker.pick({
  type: [DocumentPicker.types.allFiles],
});

DocumentPicker.pick({
  type: [DocumentPicker.types.audio],
});

DocumentPicker.pick({
  type: [DocumentPicker.types.images],
});

DocumentPicker.pick({
  type: [DocumentPicker.types.plainText],
});

DocumentPicker.pick({
  type: [DocumentPicker.types.video],
});

DocumentPicker.pick({
  type: [DocumentPicker.types.pdf],
});

DocumentPicker.pick({
  type: [DocumentPicker.types.video, DocumentPicker.types.pdf, 'public.audio'],
});

// Option is correct about pickMultiple

DocumentPicker.pickMultiple({
  type: [DocumentPicker.types.allFiles],
});

DocumentPicker.pickMultiple({
  type: [DocumentPicker.types.audio],
});

DocumentPicker.pickMultiple({
  type: [DocumentPicker.types.images],
});

DocumentPicker.pickMultiple({
  type: [DocumentPicker.types.plainText],
});

DocumentPicker.pickMultiple({
  type: [DocumentPicker.types.video],
});

DocumentPicker.pickMultiple({
  type: [DocumentPicker.types.pdf],
});

DocumentPicker.pickMultiple({
  type: [DocumentPicker.types.video, DocumentPicker.types.pdf, 'public.audio'],
});

DocumentPicker.pick({ type: 'image/jpg' });
DocumentPicker.pick({ type: 'public.png' });

DocumentPicker.pick({ type: ['image/jpg', 'image/jpeg', 'image/png', 'application/pdf'] });
DocumentPicker.pick({ type: ['public.png', 'public.jpeg'] });

try {
  throw new Error('test');
} catch (e) {
  if (DocumentPicker.isCancel(e)) {
  } else {
  }
}
