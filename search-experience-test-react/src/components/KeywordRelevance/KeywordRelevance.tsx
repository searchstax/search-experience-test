import { useState } from 'react'

// Joy
import AspectRatio from '@mui/joy/AspectRatio';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Grid from '@mui/joy/Grid';
import LinearProgress from '@mui/joy/LinearProgress';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';

function KeywordRelevance(props: {
	pageData: any | undefined,
	relevanceData: any | undefined,
	checkRelevanceCallback: (keyword: string) => Promise<any>,
}) {
	const {
		pageData = undefined,
		relevanceData = undefined,
		checkRelevanceCallback = () => {},
	} = props;
  const [loading, setLoading] = useState<boolean>(false);

  const checkSearch = async () => {
  	if (checkRelevanceCallback) {
			setLoading(true);
			await checkRelevanceCallback(relevanceData?.keyword)?.then(async () => {
				setLoading(false);
	    }).catch((error: Error) => {
				console.log('Could not get relevance data', error);
			});
		}
  }

  return (
    <Grid container xs={12} sx={{mb: 3}}>
    	{pageData !== undefined && (
				<Grid container columnSpacing={3} xs={12}>
					<Grid container xs={6}>
						{pageData?.searchpage?.searchURL && (
							<Grid xs={12}>
								<Grid xs={12}>
									<Typography level="title-md">
										Search results for "{relevanceData.keyword}"
									</Typography>
								</Grid>
								<Grid container xs={12}>
									{relevanceData?.data?.searchpage?.searchQuality?.map((result: any, index: number) => (
										<Box key={index}>
											<Stack direction="row" alignItems="center" spacing={2} sx={{pl: 2}}>
												<Typography level="body-sm">
													Relevance
												</Typography>
												<Box sx={{width: 100}}>
													<LinearProgress determinate value={result?.quality?.relevancy_score * 10} />
												</Box>
											</Stack>
											<Typography level="body-sm" sx={{pl: 2}}>
												{result.quality?.relevance_summary}
											</Typography>
											<Stack spacing={0.5}>
												<Typography level="title-sm">
													Opportunities
												</Typography>
												{result.quality?.page_recommendations?.map((recommendation: any, index: number) => (
													<Typography key={index} level="body-sm" sx={{pl: 2}}>
														- {recommendation}
													</Typography>
												))}
											</Stack>
										</Box>
									))}
								</Grid>
							</Grid>
						)}
					</Grid>
					<Grid xs={6}>
						<Box
							sx={{
								position: 'relative',
								minHeight: 300, 
								border: 'solid',
								borderWidth: 1,
							}}
						>
							<AspectRatio>
								{pageData?.screenshots?.search !== '' ? (
									<Box
										component='img'
										src={`data:image/png;base64, ${pageData?.screenshots?.search}`}
									/>
								) : (
									<Typography component="div">
								    No Search Page Found
								  </Typography>
								)}
							</AspectRatio>
							<Box
								sx={{
									position: 'absolute',
									top: 0,
									left: 0,
									height: '100%',
									width: '100%',
									backgroundColor: 'rgba(0, 0, 0, 0.5)',
								}}
							>
								<Button
									size="lg"
									onClick={checkSearch}
									disabled={loading}
									loading={loading}
									sx={{
								    top: '50%',
								    left: '50%',
								    transform: 'translate(-50%, -50%)',
									}}
								>
									Test Now
								</Button>
							</Box>
							{relevanceData?.data?.screenshots?.search && (
								<AspectRatio sx={{ 
									position: 'absolute',
									top: 0,
									left: 0,
									height: '100%',
									width: '100%', }}>
									<Box
										component='img'
										src={`data:image/png;base64, ${relevanceData?.data?.screenshots?.search}`}
										sx={{
										  "@keyframes fadein": {
										    from: {
										      opacity: 0,
										    },
										    to: {
										      opacity: 1,
										    }
										  },
										  animation: "fadein 1s ease",
										}}
									/>
								</AspectRatio>
							)}
						</Box>
					</Grid>
				</Grid>
			)}
		</Grid>
  )
}

export default KeywordRelevance
