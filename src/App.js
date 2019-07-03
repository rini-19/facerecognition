import React, {Component} from 'react'; 
import Navigation from './Components/navigation/Navigation';
import Logo from './Components/logo/Logo';
import ImageLinkForm from './Components/imageLinkForm/ImageLinkForm';
import Rank from './Components/rank/Rank';
import FaceRecognition from './Components/faceRecognition/FaceRecognition';
import SignIn from './Components/signIn/SignIn';
import Register from './Components/register/Register';
import Particles from 'react-particles-js';
import './App.css';

const particlesOptions = {
                particles: {
                  number:{
                    value: 80,
                    density:{
                      enable: true,
                      value_area: 1000
                    }
                  },
                  line_linked:{
                    enable_auto: true,
                    distance: 158,
                    opacity: 0.4,
                    width: 2
                  },
                  move:{
                    speed: 9
                  }
                },
                interactivity: {
                  events:{
                    onclick:{
                      enable: true,
                      mode: 'grab'
                    }
                  }
                }
              }
const initialState = {
      input:'',
      imageURL:'',
      box:{},
      route:'signin',
      isSignedin: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
class App extends Component {
  constructor(){
    super();
    this.state = initialState;
  }

  // componentDidMount(){
  //   fetch('http://localhost:3000')
  //    .then(response =>response.json())
  //    .then(data =>console.log(data));
  // }

  loadUser = (data) =>{
    this.setState({user:{
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.date
    }})
  }

  calculateFaceLocation = (paramtrs) =>{
    const clarifaiFace = paramtrs.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
        leftCol: width*clarifaiFace.left_col,
        rightCol: width - (width*clarifaiFace.right_col),
        topRow: height*clarifaiFace.top_row,
        bottomRow: height - (height*clarifaiFace.bottom_row)
      }

  }

  setBoxParams = (box)=>{
    this.setState({box: box});
  }

  onInputChange = (event) =>{
    this.setState({input: event.target.value});
  }

  onButtonSubmit = ()=>{
    this.setState({imageURL: this.state.input})
    fetch('http://localhost:3000/imageurl',{
    method: 'post',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      input: this.state.input
    })
  })
.then(response => response.json())
.then(response => {
      if(response){
        fetch('http://localhost:3000/image',{
        method: 'put',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          id: this.state.user.id
        })
      })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, {entries: count}))
        })
      }
      this.setBoxParams(this.calculateFaceLocation(response))
    })
    .catch(err => console.log(err));
  }

  onRouteChange = (route) =>{
    if(route === 'home')
      this.setState({isSignedin: true})
    else if(route === 'signin' || route === 'register')
      this.setState(initialState)
    this.setState({route: route})
  }

  render(){
    return (
      <div className="App">
        <Particles className='particles'
                params={particlesOptions} />
        <Navigation isSignedin = {this.state.isSignedin} onRouteChange = {this.onRouteChange}/>
        { (this.state.route === 'home')
         ?<div>
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries}/>
            <ImageLinkForm onInputChange = {this.onInputChange} onButtonSubmit = {this.onButtonSubmit}/>
            <FaceRecognition imageURL = {this.state.imageURL} box = {this.state.box}/>
          </div>
          :(
            this.state.route === 'signin'
            ?<SignIn loadUser = {this.loadUser} onRouteChange = {this.onRouteChange}/>
            :<Register loadUser = {this.loadUser} onRouteChange = {this.onRouteChange}/>
            )
          
         }
      </div>
    );
  }
}

export default App;
