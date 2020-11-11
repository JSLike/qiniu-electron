import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css';
import FileSearch from "./components/FileSearch/FileSearch";
import FileList from "./components/FileList/FileList";
import defaultFiles from "./components/FileList/defaultFiles"

function App() {

  return (
    <div className="App container-fluid" style={ {'minWidth': '1200px'} }>
      <div className="row">
        <div className="col-3 left-panel bg-danger">
          <FileSearch
            title={'My Document'}
            onFileSearch={(value)=>{console.log(value)}}
          />
          <FileList
              files={defaultFiles}
          />
        </div>
        <div className="col-9 right-panel bg-primary">
          <h1>2</h1>
        </div>
      </div>
    </div>
  );
}

export default App;
