require 'json'

package = JSON.parse(File.read(File.join(__dir__, '../package.json')))

Pod::Spec.new do |s|
  s.name         = package['name']
  s.version      = package['version']
  s.summary      = package['description']
  s.author       = package['author']
  s.homepage     = package['homepage']
  s.license      = package['license']
  s.source       = { :git => 'https://github.com/oblador/react-native-performance.git', :tag => "v#{s.version}" }

  s.platform     = :ios, "11.0"
  s.source_files = "**/*.{h,m,mm}"

  s.dependency 'React-Core'
end
