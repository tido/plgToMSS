function Run() {

  plugins = Sibelius.Plugins;

  if (not (plugins.Contains('Test') and plugins.Contains('Assert'))) {
    Sibelius.MessageBox('Please install the Test and Assert plugins!');
    ExitPlugin();
  }

  Sibelius.MessageBox('Template test plugin');

  suite = Test.Suite('Ext tests', Self, Template);

  suite
    .Add('TestFunc')
  suite.Run(suite);

}  //$end

function TestFunc(assert, plugin) {
  //$module(Run.mss)

  assert.Equal(1,1,"One is one and all alone and ever more shall be so...")
}