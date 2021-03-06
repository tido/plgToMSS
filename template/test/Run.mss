function Run() {

  plugins = Sibelius.Plugins;

  if (not (plugins.Contains('Test'))) {
    Sibelius.MessageBox('Please install the Test plugin!');
    ExitPlugin();
  }

  suite = Test.Suite('Ext tests', Self, Template);

  suite
    .Add('TestFunc')
    ;

  suite.Run();

}  //$end

function TestFunc(assert, plugin) {
  //$module(Run.mss)

  assert.Equal(1,0,'Start with a failing test...');
}  //$end
