import React, { useEffect, useState } from 'react';
import { View, Button, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { database } from './firebase/config';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { ref, set, get, onValue, serverTimestamp } from 'firebase/database';
import { BACKEND_CONFIG } from './config';

const Stack = createNativeStackNavigator();

// Backend URL configuration
const BACKEND_URL = BACKEND_CONFIG.getUrl();

// To use this app:
// 1. Update the IP address in config.js
// 2. Make sure your backend server is running (python app.py in the backend directory)
// 3. Ensure your mobile device is on the same network as your computer
// 4. If using ngrok, update the production URL in config.js

// Logo component
const LogoTitle = () => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image
        source={require('./assets/logo.png')}
        style={{ width: 140, height: 38, resizeMode: 'contain' }}
      />
    </View>
  );
};

const HomeScreen = ({ navigation }) => {
  const [plants, setPlants] = useState({
    banana: { analysis: 'Loading...', lastUpdated: null },
    mango: { analysis: 'Loading...', lastUpdated: null },
    tomato: { analysis: 'Loading...', lastUpdated: null }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const plantTypes = ['banana', 'mango', 'tomato'];
    const unsubscribeFunctions = [];

    plantTypes.forEach(plant => {
      const plantRef = ref(database, `plant_info/${plant}`);
      const unsubscribe = onValue(plantRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setPlants(prev => ({
            ...prev,
            [plant]: {
              analysis: data.analysis || 'No analysis available',
              lastUpdated: data.timestamp ? new Date(data.timestamp) : null,
              image: data.image || null
            }
          }));
        } else {
          setPlants(prev => ({
            ...prev,
            [plant]: {
              analysis: 'No analysis yet',
              lastUpdated: null,
              image: null
            }
          }));
        }
        setIsLoading(false);
      }, (error) => {
        console.error(`Error fetching ${plant} data:`, error);
        setError(`Failed to fetch ${plant} data. Please check your connection and try again.`);
        setIsLoading(false);
      });
      unsubscribeFunctions.push(unsubscribe);
    });

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return date.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plant Analysis</Text>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{error}</Text>
          <Button title="Retry" onPress={handleRetry} />
        </View>
      )}
      {isLoading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <ScrollView style={styles.scrollView}>
          {Object.entries(plants).map(([plant, data]) => (
            <TouchableOpacity
              key={plant}
              style={styles.card}
              onPress={() => navigation.navigate('Details', { plant })}
            >
              <Text style={styles.cardTitle}>
                {plant.charAt(0).toUpperCase() + plant.slice(1)} Analysis
              </Text>
              <Text style={styles.cardDescription}>
                {data.analysis || 'No analysis available'}
              </Text>
              <Text style={styles.lastUpdated}>
                Last updated: {formatDate(data.lastUpdated)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const DetailsScreen = ({ route, navigation }) => {
  const { plant } = route.params;
  const [plantData, setPlantData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const plantRef = ref(database, `plant_info/${plant}`);
    const unsubscribe = onValue(plantRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setPlantData({
          analysis: data.analysis || 'No analysis available',
          lastUpdated: data.timestamp ? new Date(data.timestamp) : null,
          image: data.image || null
        });
      } else {
        setPlantData({
          analysis: 'No analysis yet',
          lastUpdated: null,
          image: null
        });
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching plant data:', error);
      setError('Failed to load plant data. Please check your connection and try again.');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [plant, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return date.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{plant.charAt(0).toUpperCase() + plant.slice(1)} Analysis</Text>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{error}</Text>
          <Button title="Retry" onPress={handleRetry} />
        </View>
      )}
      {isLoading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <View style={styles.detailsContainer}>
          {plantData?.image && (
            <Image 
              source={{ uri: plantData.image }} 
              style={styles.plantImage}
              resizeMode="contain"
            />
          )}
          <Text style={styles.analysisText}>
            {plantData?.analysis || 'No analysis available'}
          </Text>
          <Text style={styles.lastUpdated}>
            Last updated: {formatDate(plantData?.lastUpdated)}
          </Text>
          <Button
            title="Upload New Image"
            onPress={() => navigation.navigate('Upload', { plant })}
          />
        </View>
      )}
    </View>
  );
};

function UploadScreen({ route, navigation }) {
  const { plant } = route.params;
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        setError(null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setError('Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        setError(null);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      setError('Failed to take photo. Please try again.');
    }
  };

  const uploadImage = async () => {
    if (!imageUri) {
      setError('Please select an image first');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      // Convert image to base64
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      reader.onloadend = async () => {
        try {
          const base64data = reader.result;
          
          // Log the request data (excluding the full base64 string)
          console.log('Sending request to backend:', {
            plantType: plant,
            imageSize: base64data.length,
            timestamp: new Date().toISOString()
          });
          
          // Send to backend for processing
          const analysisResponse = await fetch(`${BACKEND_URL}/analyze`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              imageData: base64data,
              plantType: plant
            }),
          });

          if (!analysisResponse.ok) {
            const errorText = await analysisResponse.text();
            console.error('Backend error response:', {
              status: analysisResponse.status,
              statusText: analysisResponse.statusText,
              error: errorText
            });
            throw new Error(`Failed to analyze image: ${analysisResponse.status} ${analysisResponse.statusText}`);
          }

          const result = await analysisResponse.json();
          console.log('Analysis result:', result);
          
          if (!result.analysis) {
            throw new Error('No analysis data received from backend');
          }
          
          // Upload result to Realtime Database
          const plantRef = ref(database, `plant_info/${plant}`);
          await set(plantRef, {
            plant: plant,
            image: base64data,
            analysis: result.analysis,
            timestamp: serverTimestamp(),
            status: 'completed'
          });
          
          navigation.navigate('Details', { plant });
        } catch (error) {
          console.error('Error processing image:', error);
          setError(error.message || 'Failed to process image. Please try again.');
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        console.error('Error reading image file');
        setError('Failed to read image file. Please try again.');
        setUploading(false);
      };
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to upload image. Please try again.');
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{error}</Text>
        </View>
      )}
      {imageUri ? (
        <>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <View style={styles.buttonContainer}>
            <Button 
              title={uploading ? "Processing..." : "Analyze Image"} 
              onPress={uploadImage}
              disabled={uploading}
            />
            <Button 
              title="Choose Different Image" 
              onPress={pickImage}
              disabled={uploading}
            />
          </View>
        </>
      ) : (
        <View style={styles.buttonContainer}>
          <Button 
            title="Take Photo" 
            onPress={takePhoto}
            disabled={uploading}
          />
          <Button 
            title="Choose from Gallery" 
            onPress={pickImage}
            disabled={uploading}
          />
        </View>
      )}
      {uploading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Processing image...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#1E1E1E', // Darker header
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  scrollView: {
    flex: 1,
    padding: 10,
  },
  plantCard: {
    backgroundColor: '#1E1E1E', // Dark card background
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  plantTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#FFFFFF', // White text
  },
  plantDescription: {
    fontSize: 14,
    color: '#B0B0B0', // Light gray text
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#808080', // Gray text
    fontStyle: 'italic',
  },
  previewImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  buttonContainer: {
    padding: 20,
    gap: 10,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#FFFFFF', // White text
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFFFFF', // White text
  },
  plantDetailCard: {
    backgroundColor: '#1E1E1E', // Dark card background
    borderRadius: 10,
    padding: 20,
    margin: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#FFFFFF', // White text
  },
  detailDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#B0B0B0', // Light gray text
    marginBottom: 15,
  },
  errorText: {
    color: '#FF6B6B', // Red error text
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#2D1E1E', // Dark red background
    margin: 10,
    borderRadius: 5,
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
    color: '#B0B0B0', // Light gray text
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#1E1E1E', // Dark header
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    color: '#FFFFFF', // White text
  },
  card: {
    backgroundColor: '#1E1E1E', // Dark card background
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#FFFFFF', // White text
  },
  cardDescription: {
    fontSize: 14,
    color: '#B0B0B0', // Light gray text
    marginBottom: 8,
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#2D1E1E', // Dark red background
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  error: {
    color: '#FF6B6B', // Red error text
    textAlign: 'center',
    marginBottom: 10,
  },
  detailsContainer: {
    flex: 1,
    padding: 20,
  },
  analysisText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFFFFF', // White text
  },
  lastUpdated: {
    fontSize: 12,
    color: '#808080', // Gray text
    fontStyle: 'italic',
  },
  plantImage: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    borderRadius: 10,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(18, 18, 18, 0.8)', // Dark overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4CAF50', // Keep green for loading
  },
});

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            headerTitle: () => <LogoTitle />,
            headerStyle: {
              backgroundColor: '#000000',
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen 
          name="Details" 
          component={DetailsScreen}
          options={({ route }) => ({ 
            title: `${route.params.plant.charAt(0).toUpperCase() + route.params.plant.slice(1)} Health Analysis`,
            headerStyle: {
              backgroundColor: '#1E1E1E',
            },
            headerTintColor: '#fff',
          })}
        />
        <Stack.Screen 
          name="Upload" 
          component={UploadScreen}
          options={{
            title: 'Upload Image',
            headerStyle: {
              backgroundColor: '#1E1E1E',
            },
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}