import { useState, useRef } from 'react';
import * as Rx from 'rxjs/Rx';

function useRxRef(initVal) {
  var subject = new Rx.BehaviorSubject(initVal)
  const subjectRef = useRef(subject)
  const [valState, setState] = useState(initVal)
  function rxNext(nextVal) {
    if (valState !== nextVal) {
      console.log(`next ${nextVal}`)
      setState(nextVal)
      subjectRef.current.next(nextVal)
    }
  }
  return [subjectRef, rxNext]
}

export default useRxRef
