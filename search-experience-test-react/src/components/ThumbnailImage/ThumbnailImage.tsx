import { useState } from 'react'

// Joy
import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';

export function ThumbnailImage(props: {
	imageURL?: string
}) {
	const {
		imageURL = '',
	} = props;
	const [imageError, setImageError] = useState<boolean>(false);

  return (
		<Box>
			{imageURL && !imageError && (
				<AspectRatio sx={{width: 200}}>
					<Box
						component="img"
						src={imageURL}
						  onError={(_e) => {
								setImageError(true);
						  }}
					/>
				</AspectRatio>
			)}
		</Box>
  )
}
