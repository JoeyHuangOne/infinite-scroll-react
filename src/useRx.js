import { useRef } from 'react';
import * as Rx from 'rxjs/Rx';

function useRxRef(initVal) {
  var subject = new Rx.BehaviorSubject(initVal).distinctUntilChanged()
  const subjectRef = useRef(subject)
  return [subjectRef, nextVal => subjectRef.current.next(nextVal)]
}

export default useRxRef
